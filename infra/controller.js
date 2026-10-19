import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
} from "@/infra/errors";

function onNoMatchHandler(request, response) {
  const publicError = new MethodNotAllowedError();
  console.error("PUBLIC ERROR:", publicError);
  response.status(405).json(publicError);
}

function onErrorHandler(error, request, response) {
  if (error instanceof ValidationError) {
    return response.status(error.statusCode).json(error);
  }

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
