import { useTheme } from "../../../../Contexts/ThemeProvider";
import Breadcrumb from "../../components/Breadcrumb";
import InfoBox from "../../components/InfoBox";
import CodeBlock from "../../components/CodeBlock";

export default function Installation() {
  const { theme } = useTheme();

  return (
    <div className="max-w-4xl">
      <Breadcrumb
        items={[
          { label: "Documentation", path: "/docs" },
          {
            label: "Getting Started",
            path: "/docs/getting-started/introduction",
          },
          { label: "Installation" },
        ]}
      />

      <h1 className={`text-4xl font-bold ${theme.text} mb-4`}>Installation</h1>

      <p className={`text-lg ${theme.textSecondary} mb-8`}>
        Set up RTC Editor for development or self-hosting.
      </p>

      <InfoBox type="info" title="Cloud vs Self-Hosted">
        <p>
          <strong>Cloud Version:</strong> Simply sign up at our website - no
          installation required!
          <br />
          <strong>Self-Hosted:</strong> Follow this guide to run RTC Editor on
          your own infrastructure.
        </p>
      </InfoBox>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          System Requirements
        </h2>

        <div className={`${theme.surfaceSecondary} p-6 rounded-lg space-y-4`}>
          <div>
            <h3 className={`font-semibold ${theme.text} mb-2`}>
              For Self-Hosting:
            </h3>
            <ul
              className={`list-disc list-inside space-y-1 ${theme.textSecondary}`}
            >
              <li>Node.js 18+ and npm</li>
              <li>Docker and Docker Compose</li>
              <li>Redis (for message queue)</li>
              <li>PostgreSQL database (or Supabase account)</li>
              <li>4GB+ RAM recommended</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          Clone the Repository
        </h2>

        <CodeBlock
          language="bash"
          code={`git clone https://github.com/AnujaKalahara99/Realtime-Collaborative-Code-Editor.git
cd Realtime-Collaborative-Code-Editor`}
        />
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          Environment Configuration
        </h2>

        <p className={`${theme.textSecondary} mb-4`}>
          Create <code className="font-mono text-sm">.env</code> files for each
          service:
        </p>

        <h3 className={`text-lg font-semibold ${theme.text} mb-3 mt-6`}>
          Frontend/.env
        </h3>
        <CodeBlock
          filename="Frontend/.env"
          code={`VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:4000
VITE_BACKEND_WS_URL=ws://localhost:3002`}
        />

        <h3 className={`text-lg font-semibold ${theme.text} mb-3 mt-6`}>
          API_Gateway/.env
        </h3>
        <CodeBlock
          filename="API_Gateway/.env"
          code={`PORT=4000
SUPABASE_JWT_SECRET=your_jwt_secret`}
        />

        <h3 className={`text-lg font-semibold ${theme.text} mb-3 mt-6`}>
          Codespace_Service/.env
        </h3>
        <CodeBlock
          filename="Codespace_Service/.env"
          code={`SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
Email_user=your_email@gmail.com
Email_password=your_app_password
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key`}
        />

        <h3 className={`text-lg font-semibold ${theme.text} mb-3 mt-6`}>
          WS_Server/.env
        </h3>
        <CodeBlock
          filename="WS_Server/.env"
          code={`SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3002`}
        />
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          Install Dependencies
        </h2>

        <CodeBlock
          language="bash"
          code={`# Install dependencies for all services
cd Frontend && npm install && cd ..
cd API_Gateway && npm install && cd ..
cd Codespace_Service && npm install && cd ..
cd WS_Server && npm install && cd ..
cd Version_Engine/worker-git && npm install && cd ../..`}
        />
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          Database Setup
        </h2>

        <p className={`${theme.textSecondary} mb-4`}>
          You can either use Supabase (cloud) or set up PostgreSQL locally.
        </p>

        <InfoBox type="info" title="Using Supabase (Recommended)">
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Create a free account at{" "}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                supabase.com
              </a>
            </li>
            <li>Create a new project</li>
            <li>
              Run the SQL schema from{" "}
              <code className="font-mono text-sm">database/schema.sql</code>
            </li>
            <li>Copy your project URL and anon key to the .env files</li>
          </ol>
        </InfoBox>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          Run with Docker Compose
        </h2>

        <CodeBlock
          language="bash"
          code={`# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down`}
        />

        <InfoBox type="success" title="Services Running">
          <ul className="list-disc list-inside space-y-1">
            <li>
              Frontend:{" "}
              <a
                href="http://localhost:5173"
                className="text-blue-500 underline"
              >
                http://localhost:5173
              </a>
            </li>
            <li>API Gateway: http://localhost:4000</li>
            <li>WebSocket Server: ws://localhost:3002</li>
          </ul>
        </InfoBox>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          Development Mode
        </h2>

        <p className={`${theme.textSecondary} mb-4`}>
          For development, you can run services individually:
        </p>

        <CodeBlock
          language="bash"
          code={`# Terminal 1 - Frontend
cd Frontend && npm run dev

# Terminal 2 - API Gateway
cd API_Gateway && npm run dev

# Terminal 3 - Codespace Service
cd Codespace_Service && npm run dev

# Terminal 4 - WebSocket Server
cd WS_Server && npm run dev`}
        />
      </section>

      <InfoBox type="warning" title="Important Notes">
        <ul className="list-disc list-inside space-y-1">
          <li>Make sure Redis is running before starting the Version Engine</li>
          <li>Configure CORS settings if deploying to production</li>
          <li>
            Use environment-specific .env files for different deployment stages
          </li>
        </ul>
      </InfoBox>
    </div>
  );
}
