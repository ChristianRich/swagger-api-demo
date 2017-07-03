module.exports = {
	get: (req, res) => {
        res.json({
            uptime: process.uptime()
        });
	}
};
