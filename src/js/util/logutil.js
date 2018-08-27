let LOG = {
	d: function (str)
	{
		console.log(str);
	},
	red: function (str)
	{
		console.log('%c' + str, 'color:red');
	},
	green: function (str)
	{
		console.log('%c' + str, 'color:green');
	},
	blue: function (str)
	{
		console.log('%c' + str, 'color:blue');
	},
	white: function (str)
	{
		console.log('%c' + str, 'color:white');
	},
	spro: function (title)
	{
		console.time(title);
	},
	epro: function (title)
	{
		console.timeEnd(title);
	}
};

export default LOG;