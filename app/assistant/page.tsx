'use client'
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

export default function AssistantPage() {
  const [messages, setMessages] = useState([
    {
      sender: "Uva",
      text: "Hola, Kevin. ¿En qué puedo ayudarte hoy? 🤖"
    }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = { sender: "Tú", text: input };
    const response = {
      sender: "Uva",
      text: "Esta es una respuesta simulada de Uva."
    };

    setMessages((prev) => [...prev, newMessage, response]);
    setInput("");
  };

  const router = useRouter();
  useEffect(() => {
    const ticket = localStorage.getItem('playfabTicket');
    if (!ticket) router.replace('/login');
  }, []);

  return (
    <div className="flex h-screen text-white bg-[#1E1E1E] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#202124] flex flex-col p-4 border-r border-[#3C4043]">
        <button className="flex items-center gap-2 p-2 rounded hover:bg-[#3C4043] text-sm">
          <span>✏️</span> Nueva conversación
        </button>
        <button className="flex items-center gap-2 p-2 mt-2 rounded hover:bg-[#3C4043] text-sm">
          <span>🔍</span> Descubrir Gems
        </button>
        <div className="mt-auto border-t border-[#3C4043] pt-4">
          <button className="text-sm hover:underline">⚙️ Ajustes y ayuda</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col relative">
        <div className="flex justify-between items-center p-6">
          <h1 className="text-3xl font-semibold">
            Hola, <span className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">KEVIN DAVID</span>
          </h1>
          <div className="flex items-center gap-4">
            <button className="bg-[#3C4043] px-4 py-1 rounded-full text-sm">✨ Probar</button>
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-bold">U</div>
          </div>
        </div>

        <div className="flex-1 px-6 pb-40 overflow-y-auto">
          <div className="p-4 bg-[#2D2F31] rounded-lg max-w-2xl">
            <p className="text-sm">
              <span className="text-white font-semibold">Damos la bienvenida a <span className="text-[#8AB4F8]">Uva</span></span>, tu asistente de IA personal
            </p>
            <p className="text-xs text-[#BDC1C6] mt-2">
              Se aplican los <a href="#" className="underline">Términos de Projective Staffing</a> y el <a href="#" className="underline">Aviso de Privacidad</a>. Las conversaciones se revisan para mejorar la IA de Projective Staffing...
            </p>
          </div>

          {/* Mensajes del chat */}
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

          {/* Chat input fijo abajo */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#1E1E1E] p-6 border-t border-[#3C4043]">
            <div className="flex flex-col w-full max-w-2xl mx-auto">
              <div className="flex items-center gap-2 p-4 rounded-lg bg-[#202124] border border-[#3C4043]">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Pregunta a Uva"
                  className="bg-transparent flex-1 outline-none text-white placeholder:text-[#BDC1C6]"
                />
                <button onClick={handleSend} className="text-xl">📨</button>
              </div>
              <div className="flex gap-2 mt-2">
                <button className="flex items-center gap-1 text-xs px-3 py-1 bg-[#3C4043] rounded-full">➕ Deep Research</button>
                <button className="flex items-center gap-1 text-xs px-3 py-1 bg-[#3C4043] rounded-full">🖼️ Canvas</button>
              </div>
            </div>
          </div>
      </main>
    </div>
  );
}
