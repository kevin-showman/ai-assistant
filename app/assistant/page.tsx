'use client'
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { PlayFabClient } from 'playfab-sdk';

interface AzureEntity {
  category: string;
  text: string;
  offset: number;
  length: number;
  confidenceScore: number;
}

interface Message {
  sender: string;
  text: string;
}

interface TaskData {
  task: string;
  date: string;
}

type TaskRoles = Record<string, TaskData[]>;

export default function AssistantPage() {
  const [username, setUsername] = useState<string>('NO LOGGED');
  const [taskRoles, setTaskRoles] = useState<TaskRoles>({});
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "Youtask",
      text: "Hi. How can help you? 🤖"
    }
  ]);
  const [input, setInput] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    const ticket = sessionStorage.getItem('playfabTicket');
    if (!ticket) router.replace('/login');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PlayFabClient.GetAccountInfo(null, (error, result) => {
      if (error) {
        console.error("Failed:", error);
      } else {
        setUsername(result.data?.AccountInfo?.TitleInfo?.DisplayName ?? "User");
      }
    });
  }, [router]);

  function getEntity(type: string, entities: AzureEntity[]): string | null {
    const found = entities?.find((e) => e.category === type);
    return found?.text ?? null;
  }

  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      const res = await fetch("https://chatbot-language-ai.cognitiveservices.azure.com/language/:analyze-conversations?api-version=2024-11-15-preview", {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": "BM0wbCnzCWdGnVzOUvRlFjU9C1p8MhlK83TDftuSkGSKSqaVlm8JJQQJ99BFACYeBjFXJ3w3AAAaACOGotwn",
          "Apim-Request-Id": "4ffcac1c-b2fc-48ba-bd6d-b69d9942995a",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind: "Conversation",
          analysisInput: {
            conversationItem: {
              id: "1",
              text: input,
              modality: "text",
              language: "en",
              participantId: "user"
            }
          },
          parameters: {
            projectName: "youtask",
            verbose: true,
            deploymentName: "youtaskv2",
            stringIndexType: "TextElement_V8"
          }
        })
      });

      const data = await res.json();
      const topIntent = data?.result?.prediction?.topIntent as string;
      const entities = data?.result?.prediction?.entities as AzureEntity[];

      let respuesta = "";

      switch (topIntent) {
        case "say_hi":
          respuesta = "Hi! How can I help you?";
          break;

        case "add_task":
          const taskName = getEntity("task_name", entities) ?? "a task";
          const role = getEntity("role", entities) ?? "personal";
          const fecha = getEntity("due_date", entities) ?? "date undefined";

          setTaskRoles(prev => {
            const currentTasks = prev[role] ?? [];
            return {
              ...prev,
              [role]: [...currentTasks, { task: taskName, date: fecha }]
            };
          });

          respuesta = `Done. I'll add "${taskName}" under the role "${role}", date "${fecha}". right?`;
          break;

        default:
          respuesta = `I detected the intent: ${topIntent}, but I'm not sure what you want to do.`;
      }

      setMessages(prev => [
        ...prev,
        { sender: "You", text: input },
        { sender: "YouTask", text: respuesta }
      ]);

      setInput("");
    } catch (ex) {
      console.error("Error:", ex);
    }
  };

  return (
    <div className="flex h-screen text-white bg-[#1E1E1E] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#202124] flex flex-col p-4 border-r border-[#3C4043] overflow-y-auto">
        {/* NUEVO: Lista de Roles y Tareas */}
        <div className="text-sm text-white space-y-2">
          {Object.entries(taskRoles).map(([role, tasks], i) => (
            <div key={i}>
              <div className="font-semibold text-[#8AB4F8]">{i + 1}. {role}</div>
              <ul className="ml-4 list-disc">
                {tasks.map((t, j) => (
                  <li key={j} className="text-xs text-[#BDC1C6]">
                    {i + 1}.{j + 1} {t.task} <span className="text-[#5f6368]">({t.date})</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-auto border-t border-[#3C4043] pt-4">
          <button className="text-sm hover:underline">⚙️ Settings</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col relative">
        <div className="flex justify-between items-center p-6">
          <h1 className="text-3xl font-semibold">
            Hello, <span className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">{username}</span>
          </h1>
          <div className="flex items-center gap-4">
            <button className="bg-[#3C4043] px-4 py-1 rounded-full text-sm">✨ Profile</button>
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-bold">{username.charAt(0)}</div>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 px-6 pb-40 overflow-y-auto">
          <div className="p-4 bg-[#2D2F31] rounded-lg max-w-2xl">
            <p className="text-sm">
              <span className="text-white font-semibold">Welcome to <span className="text-[#8AB4F8]">Youtask</span></span>, your AI assistant
            </p>
            <p className="text-xs text-[#BDC1C6] mt-2">
              The <a href="#" className="underline">Projective Staffing Terms</a> and <a href="#" className="underline">Privacity notice apply</a>.
            </p>
          </div>

          <div className="left-0 right-0 bg-[#1E1E1E] p-6 border-t border-[#3C4043]">
            <div className="flex flex-col w-full max-w-2xl mx-auto">
              <div className="flex flex-col items-center gap-2 p-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg w-fit max-w-full ${msg.sender === "Tú"
                      ? "bg-[#3C4043] self-end"
                      : "bg-[#2D2F31] self-start"
                      }`}
                  >
                    <p className="text-sm">
                      <strong>{msg.sender}:</strong> {msg.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat input */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#1E1E1E] p-6 border-t border-[#3C4043]">
          <div className="flex flex-col w-full max-w-2xl mx-auto">
            <div className="flex items-center gap-2 p-4 rounded-lg bg-[#202124] border border-[#3C4043]">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Pregunta a Youtask"
                className="bg-transparent flex-1 outline-none text-white placeholder:text-[#BDC1C6]"
              />
              <button onClick={handleSend} className="text-xl">📨</button>
            </div>
            <div className="flex gap-2 mt-2">
              <button className="flex items-center gap-1 text-xs px-3 py-1 bg-[#3C4043] rounded-full">➕ Research</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
