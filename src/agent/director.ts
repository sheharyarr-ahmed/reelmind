import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import type Anthropic from "@anthropic-ai/sdk";
import type {
  DirectorState as DirectorStateType,
  Scene,
  VideoManifest,
  BrandTemplateSnapshot,
} from "./schemas";
import { withTrace } from "./trace";
import { parseScript } from "./nodes/parse_script";
import { planScenes } from "./nodes/plan_scenes";
import { assignTiming } from "./nodes/assign_timing";
import { selectAnimations } from "./nodes/select_animations";
import { validate } from "./nodes/validate";
import { critique } from "./nodes/critique";
import { compileManifest } from "./nodes/compile_manifest";

const MAX_RETRIES = 2;

const StateAnnotation = Annotation.Root({
  script: Annotation<string>(),
  brandTemplate: Annotation<BrandTemplateSnapshot>(),
  userId: Annotation<string>(),
  projectId: Annotation<string | null>({
    default: () => null,
    reducer: (_prev, next) => next,
  }),
  cleanedScript: Annotation<string>({
    default: () => "",
    reducer: (_prev, next) => next,
  }),
  scenes: Annotation<Scene[]>({
    default: () => [],
    reducer: (_prev, next) => next,
  }),
  totalDuration: Annotation<number>({
    default: () => 0,
    reducer: (_prev, next) => next,
  }),
  retryCount: Annotation<number>({
    default: () => 0,
    reducer: (_prev, next) => next,
  }),
  errors: Annotation<string[]>({
    default: () => [],
    reducer: (_prev, next) => next,
  }),
  critiqueNotes: Annotation<string | null>({
    default: () => null,
    reducer: (_prev, next) => next,
  }),
  manifest: Annotation<VideoManifest | null>({
    default: () => null,
    reducer: (_prev, next) => next,
  }),
});

type GraphState = typeof StateAnnotation.State;

type NodeOutput = Partial<DirectorStateType> & { _tokensUsed?: number };

function tracedNode(
  name: string,
  llmCall: boolean,
  fn: (state: DirectorStateType) => Promise<NodeOutput>,
) {
  return async (state: GraphState): Promise<Partial<DirectorStateType>> => {
    const ctx = { userId: state.userId, projectId: state.projectId };
    return withTrace(ctx, name, llmCall, state, async () => {
      const partial = await fn(state as DirectorStateType);
      const { _tokensUsed, ...rest } = partial;
      return { result: rest, tokensUsed: _tokensUsed };
    });
  };
}

function routeFromValidate(state: GraphState): "critique" | "plan_scenes" | "__end__" {
  if (state.errors.length === 0) return "critique";
  if (state.retryCount < MAX_RETRIES) return "plan_scenes";
  return "__end__";
}

export type DirectorOptions = { client?: Anthropic };

export function createDirector(options: DirectorOptions = {}) {
  return new StateGraph(StateAnnotation)
    .addNode("parse_script", tracedNode("parse_script", false, parseScript))
    .addNode(
      "plan_scenes",
      tracedNode("plan_scenes", true, (s) => planScenes(s, options)),
    )
    .addNode("assign_timing", tracedNode("assign_timing", false, assignTiming))
    .addNode(
      "select_animations",
      tracedNode("select_animations", false, selectAnimations),
    )
    .addNode("validate", tracedNode("validate", false, validate))
    .addNode(
      "critique",
      tracedNode("critique", true, (s) => critique(s, options)),
    )
    .addNode(
      "compile_manifest",
      tracedNode("compile_manifest", false, compileManifest),
    )
    .addEdge(START, "parse_script")
    .addEdge("parse_script", "plan_scenes")
    .addEdge("plan_scenes", "assign_timing")
    .addEdge("assign_timing", "select_animations")
    .addEdge("select_animations", "validate")
    .addConditionalEdges("validate", routeFromValidate, {
      critique: "critique",
      plan_scenes: "plan_scenes",
      __end__: END,
    })
    .addEdge("critique", "compile_manifest")
    .addEdge("compile_manifest", END)
    .compile();
}

export type DirectorInput = {
  script: string;
  brandTemplate: BrandTemplateSnapshot;
  userId: string;
  projectId: string | null;
};

export async function runDirector(
  input: DirectorInput,
  options: DirectorOptions = {},
): Promise<GraphState> {
  const graph = createDirector(options);
  return await graph.invoke(input);
}
