const errorResponse = (res, error, statusCode = 500) => {
  let message = "Internal server error";
  let status = statusCode;

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  }

  // If status is still 500, check if error object has a status
  if (status === 500 && error.status) status = error.status;

  return res.status(status).json({
    status,
    message,
  });
};

const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    status: statusCode,
    message,
  };
  if (data) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

module.exports = { successResponse, errorResponse };