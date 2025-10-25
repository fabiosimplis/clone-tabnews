import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);

  if (!response.ok) {
    throw new Error(`ERROR: ${response.status}`);
  }

  return await response.json();
}

function StatusPage() {
  const { data, isLoading } = useSWR("api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  if (isLoading) {
    return <h1>Carregando</h1>;
  }

  return (
    <>
      <h1>Status</h1>
      <UpdatedAt data={data} />
      <DatabaseStatus data={data} />
    </>
  );
}

export default StatusPage;

function UpdatedAt({ data }) {
  let updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");

  return <div>Última atualização: {updatedAtText}</div>;
}

function DatabaseStatus({ data }) {
  return (
    <>
      <h2>Database</h2>
      <div>Versão: {data.dependencies.database.version}</div>
      <div>
        Conexões abertas: {data.dependencies.database.opened_connections}
      </div>
      <div>Conexões máximas: {data.dependencies.database.max_connections}</div>
    </>
  );
}
