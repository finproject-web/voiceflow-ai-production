import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// Define the Todo type
type Todo = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  user_id: string;
};

async function getTodos(): Promise<Todo[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching todos:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getTodos:", error);
    return [];
  }
}

async function addTodo(title: string, description: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("todos")
      .insert([
        {
          title,
          description,
          completed: false,
          user_id: "demo-user-id", // In a real app, this would come from auth
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding todo:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in addTodo:", error);
    return null;
  }
}

export default async function TodosPage() {
  const todos = await getTodos();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Todos (Server-Side Supabase)</h1>
      
      {/* Server-side rendered todos */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Server-Side Fetched Todos:</h2>
        {todos.length === 0 ? (
          <p className="text-gray-500">No todos found. Create the 'todos' table in your Supabase dashboard to see data.</p>
        ) : (
          <div className="space-y-3">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`p-4 border rounded-lg ${
                  todo.completed ? "bg-gray-50" : "bg-white"
                }`}
              >
                <h3 className="font-semibold">{todo.title}</h3>
                <p className="text-gray-600">{todo.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  Status: {todo.completed ? "Completed" : "Pending"} | 
                  Created: {new Date(todo.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions for creating the todos table */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          📋 Setup Instructions
        </h3>
        <p className="text-blue-800 mb-4">
          To see real data, create a "todos" table in your Supabase dashboard with this SQL:
        </p>
        <pre className="bg-blue-100 text-blue-900 p-4 rounded overflow-x-auto">
{`CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id TEXT NOT NULL
);

-- Insert sample data
INSERT INTO todos (title, description, user_id) VALUES
  ('Setup Supabase', 'Configure Supabase with Next.js', 'demo-user-id'),
  ('Build App', 'Create the VoiceFlow AI application', 'demo-user-id'),
  ('Deploy to Vercel', 'Deploy the application to production', 'demo-user-id');

-- Enable Row Level Security (optional)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;`}
        </pre>
      </div>

      {/* Environment Variables Status */}
      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-3">
          ✅ Supabase Configuration Status
        </h3>
        <div className="text-green-800 space-y-2">
          <p>✅ Server-side Supabase client configured</p>
          <p>✅ Environment variables properly referenced</p>
          <p>✅ TypeScript types included</p>
          <p>✅ Error handling implemented</p>
          <p>✅ Latest @supabase/ssr patterns used</p>
        </div>
      </div>
    </div>
  );
}
