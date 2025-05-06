const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({
        status: 'success',
        data,
    });
};

const sendError = (res, data, message = 'Failed', statusCode = 400) => {
    res.status(statusCode).json({
        status: 'failed',
        data,
    });
};

module.exports = {
    sendSuccess,
    sendError,
};
