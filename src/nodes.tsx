import { Handle, Position } from "reactflow";

import { configApp } from "@/config";
import {
  LIST_MODES,
  MODELS,
  OpenRouterNode,
  PROMPTS,
} from "@/nodes/ai-chats/openrouter";
import { WorkflowNode } from "@/types";
import { ImagePigNode } from "./nodes/ai-images/pig";
import { MiniMaxVideoNode } from "./nodes/ai-videos/minimaxVideo";
import { TestNode } from "./nodes/statics/test";
import { TelegramSendNode } from "./nodes/ai-events/telegramSend";
import { useState } from "react";
import {
  HF_LIST_MODES,
  HF_MODELS,
  // HF_OUTPUT_TYPES,
  HF_PROMPTS,
  HuggingFaceNode,
} from "./nodes/ai-images/hugging";
import { FanpageSendNode } from "./nodes/ai-events/fanpageSend";

interface INodeConnect {
  data: {
    setOutputType(newOutputType: string): unknown;
    setModel(newModel: string): unknown;
    setPrompt(newPrompt: string): unknown;
    label: string;
    type: string;
    status?: string;
  };
}

const getStatusClass = (status?: string) => {
  switch (status) {
    case "loading":
      return "bg-yellow-300 text-black";
    case "success":
      return "bg-green-500 text-white";
    case "failed":
      return "bg-red-500 text-white";
    case "pending":
    default:
      return "bg-white text-black";
  }
};

const nodeConnect = ({ data }: INodeConnect) => (
  <div className={`${configApp.boxNode}`}>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
    {data.label}
    {data.status && (
      <div className={`${getStatusClass(data.status)}`}>
        Status: {data.status}
      </div>
    )}
  </div>
);

const FanpageNodeUI = ({ data }: INodeConnect) => (
  <div className={`${configApp.boxNode}`}>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
    {data.label}
    <div>
      <a
        className="bg-black text-white p-1 rounded hover:bg-gray-800"
        href="https://www.facebook.com/profile.php?id=100064871737689"
        target="_blank"
        rel="noreferrer"
      >
        Go to Fanpage Test
      </a>
    </div>
    {data.status && (
      <div className={`${getStatusClass(data.status)}`}>
        Status: {data.status}
      </div>
    )}
  </div>
);

const TelegramNodeUI = ({ data }: INodeConnect) => (
  <div className={`${configApp.boxNode}`}>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
    {data.label}
    <div>
      <a
        className="bg-black text-white p-1 rounded hover:bg-gray-800"
        href="https://web.telegram.org/a/#-1002210465337_1"
        target="_blank"
        rel="noreferrer"
      >
        Go to Channel Test
      </a>
    </div>
    {data.status && (
      <div className={`${getStatusClass(data.status)}`}>
        Status: {data.status}
      </div>
    )}
  </div>
);

const OpenRouterNodeUI = ({ data }: INodeConnect) => {
  const [selectedPrompt, setSelectedPrompt] =
    useState<keyof typeof PROMPTS>("SEO_ARTICLE");
  const [selectedModel, setSelectedModel] = useState<keyof typeof MODELS>(
    LIST_MODES.qwen
  );

  const handlePromptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPrompt = e.target.value as keyof typeof PROMPTS;
    setSelectedPrompt(newPrompt);
    data.setPrompt?.(newPrompt);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value as keyof typeof MODELS;
    setSelectedModel(newModel);
    data.setModel?.(newModel.toString());
  };
  return (
    <div className={`${configApp.boxNode}`}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div>{data.label}</div>
      <div className="mt-2">
        <label className="block text-sm">Prompt:</label>
        <select
          value={selectedPrompt}
          onChange={handlePromptChange}
          className="w-full p-1 border rounded text-black bg-white"
        >
          {Object.entries(PROMPTS).map(([key, value]) => (
            <option key={key} value={key}>
              {value.description}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-2">
        <label className="block text-sm">Model:</label>
        <select
          value={selectedModel}
          onChange={handleModelChange}
          className="w-full p-1 border rounded text-black bg-white"
        >
          {Object.entries(MODELS).map(([key, value]) => (
            <option key={key} value={key}>
              {value.name}
            </option>
          ))}
        </select>
      </div>
      {data.status && (
        <div className={`${getStatusClass(data.status)} mt-2`}>
          Status: {data.status}
        </div>
      )}
    </div>
  );
};

const HuggingFaceNodeUI = ({ data }: INodeConnect) => {
  const [selectedPrompt, setSelectedPrompt] =
    useState<keyof typeof HF_PROMPTS>("TEXT_TO_IMAGE");
  const [selectedModel, setSelectedModel] = useState<keyof typeof HF_MODELS>(
    HF_LIST_MODES.stableDiffusion2
  );
  // const [selectedOutputType, setSelectedOutputType] = useState<
  //   keyof typeof HF_OUTPUT_TYPES
  // >(HF_OUTPUT_TYPES.IMAGE);

  const handlePromptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPrompt = e.target.value as keyof typeof HF_PROMPTS;
    setSelectedPrompt(newPrompt);
    data.setPrompt?.(newPrompt);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value as keyof typeof HF_MODELS;
    setSelectedModel(newModel);
    data.setModel?.(newModel.toString());
  };

  // const handleOutputTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const newOutputType = e.target.value as keyof typeof HF_OUTPUT_TYPES;
  //   setSelectedOutputType(newOutputType);
  //   data.setOutputType?.(newOutputType);
  // };

  return (
    <div className={`${configApp.boxNode}`}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div>{data.label}</div>
      <div className="mt-2">
        <label className="block text-sm">Prompt:</label>
        <select
          value={selectedPrompt}
          onChange={handlePromptChange}
          className="w-full p-1 border rounded text-black bg-white"
        >
          {Object.entries(HF_PROMPTS).map(([key, value]) => (
            <option key={key} value={key}>
              {value.description}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-2">
        <label className="block text-sm">Model:</label>
        <select
          value={selectedModel}
          onChange={handleModelChange}
          className="w-full p-1 border rounded text-black bg-white"
        >
          {Object.entries(HF_MODELS).map(([key, value]) => (
            <option key={key} value={key}>
              {value.name}
            </option>
          ))}
        </select>
      </div>
      {/* <div className="mt-2">
        <label className="block text-sm">Output Type:</label>
        <select
          value={selectedOutputType}
          onChange={handleOutputTypeChange}
          className="w-full p-1 border rounded text-black bg-white"
        >
          {Object.entries(HF_OUTPUT_TYPES).map(([key, value]) => (
            <option key={key} value={key}>
              {value === HF_OUTPUT_TYPES.IMAGE ? "Image" : "GIF"}
            </option>
          ))}
        </select>
      </div> */}
      {data.status && (
        <div className={`${getStatusClass(data.status)} mt-2`}>
          Status: {data.status}
        </div>
      )}
    </div>
  );
};
const nodeTypes = {
  minimaxVideo: nodeConnect,
  openrouter: OpenRouterNodeUI,
  pig: nodeConnect,
  telegramSend: TelegramNodeUI,
  huggingface: HuggingFaceNodeUI,
  fanpageSend: FanpageNodeUI,
  test: nodeConnect,
};

const availableNodes: {
  type: string;
  label: string;
  nodeClass: new () => WorkflowNode;
}[] = [
  {
    type: "openrouter",
    label: "Open Router",
    nodeClass: OpenRouterNode,
  },
  { type: "pig", label: "Pig", nodeClass: ImagePigNode },
  { type: "minimaxVideo", label: "MiniMax Video", nodeClass: MiniMaxVideoNode },
  {
    type: "huggingface",
    label: "Hugging Face",
    nodeClass: HuggingFaceNode,
  },
  {
    type: "telegramSend",
    label: "Telegram Send",
    nodeClass: TelegramSendNode,
  },
  {
    type: "fanpageSend",
    label: "Fanpage Send",
    nodeClass: FanpageSendNode,
  },
];

export { availableNodes, nodeTypes };
