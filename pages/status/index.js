import useSWR from "swr";

async function fetchApi(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

function UpdatedAt({ updatedAt }) {
  return <>Última atualização: {new Date(updatedAt).toLocaleString("pt-BR")}</>;
}

function StatusDetails() {
  const { isLoading, data, error } = useSWR("/api/v1/status", fetchApi, {
    refreshInterval: 2000, // Refresh every 2 seconds
  });

  if (error) return <>Failed to load status</>;
  if (isLoading) return <>Loading...</>;
  return (
    <>
      <UpdatedAt updatedAt={data.updated_at} />
      <div>
        <h2>Dependências:</h2>
        <h3>Banco de dados:</h3>
        <p>Versão: {data.dependencies.database.version}</p>
        <p>Máx. de conexões: {data.dependencies.database.max_connections}</p>
        <p>
          Núm. con. abertas: {data.dependencies.database.opened_connections}
        </p>
      </div>
    </>
  );
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <StatusDetails />
    </>
  );
}
