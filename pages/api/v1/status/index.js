function status(request, response) {
  response.status(200).json({ chave: "Você é um programador acima da média!" });
}

export default status;
