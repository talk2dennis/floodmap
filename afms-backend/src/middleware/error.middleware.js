const errorHandler = (err, req, res, next) => {
	const status = err.statusCode || err.status || 500
	const message = err.message || 'Internal Server Error'

	if (process.env.NODE_ENV !== 'production') {
		// eslint-disable-next-line no-console
		console.error(err)
	}

	res.status(status).json({
		success: false,
		message,
		...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
	})
}

export default errorHandler
