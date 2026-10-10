import { InternalServerError, MethodNotAllowedError } from "@/infra/errors";

function onNoMatchHandler(request, response) {
  const publicError = new MethodNotAllowedError();
  console.error("PUBLIC ERROR:", publicError);
  response.status(405).json(publicError);
}

function onErrorHandler(error, request, response) {
  const publicError = new InternalServerError({
    cause: error,
    statusCode: error.statusCode,
  });
  console.error("PUBLIC ERROR:", publicError);
  response.status(publicError.statusCode).json(publicError);
}

const controllers = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controllers;
