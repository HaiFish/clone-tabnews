import database from "@/infra/database";

async function status(request, response) {
  const result = await database.query("SELECT 1 + 1 AS SUM;");
  console.log(result.rows);

  response.status(200).json({ chave: "Você é um programador acima da média!" });
}

export default status;
