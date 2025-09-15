import React, { useState } from 'react';

type GPTResponse = {

    intent?: string;

    taskname?: string;

    fecha?: string;

    relationship?: string;

    error?: string;

};

const sendMessage = async (text: string): Promise<GPTResponse> => {

  try {

    const res = await fetch(

      'https://gtp4-youtask.openai.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2025-01-01-preview',

      {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

          'api-key': process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY!,

        },

        body: JSON.stringify({

          messages: [

            {

              role: 'system',

              content:

                'Responde en formato JSON con los campos: intent, taskname, fecha, relationship.',

            },

            {

              role: 'user',

              content: text,

            },

          ],

          temperature: 0.7,

          response_format: { type: 'json_object' },

        }),

      }

    );
 
    if (!res.ok) {

      const error = await res.json();

      console.error('Error del servidor:', error);

      return { error: error.message || 'Error desconocido' };

    }
 
    const data: GPTResponse = await res.json();

    console.log('Respuesta GPT:', data);

    return data;

  } catch (err) {

    console.error('Error de red o parsing:', err);

    return { error: 'No se pudo conectar con el modelo GPT' };

  }

};

 

const GPTTaskInterpreter: React.FC = () => {

    const [input, setInput] = useState('');

    const [response, setResponse] = useState<GPTResponse | null>(null);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();

        setLoading(true);

        const result = await sendMessage(input);

        setResponse(result);

        setLoading(false);

    };

    return (
        <div style={{ padding: '1rem', maxWidth: '600px', margin: 'auto' }}>
            <h2>🧠 Interprete de Tareas GPT</h2>
            <form onSubmit={handleSubmit}>
                <input

                    type="text"

                    placeholder="Escribe tu tarea..."

                    value={input}

                    onChange={(e) => setInput(e.target.value)}

                    style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}

                />
                <button type="submit" disabled={loading}>

                    {loading ? 'Procesando...' : 'Interpretar'}
                </button>
            </form>

            {response && (
                <div style={{ marginTop: '1rem', background: '#f4f4f4', padding: '1rem', borderRadius: '8px' }}>

                    {response.error ? (
                        <p style={{ color: 'red' }}>⚠️ Error: {response.error}</p>

                    ) : (
                        <>
                            <p><strong>Intent:</strong> {response.intent}</p>
                            <p><strong>Tarea:</strong> {response.taskname}</p>
                            <p><strong>Fecha:</strong> {response.fecha}</p>
                            <p><strong>Relación:</strong> {response.relationship}</p>
                        </>

                    )}
                </div>

            )}
        </div>

    );

};

export default GPTTaskInterpreter;

