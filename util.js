// custom template literal log function

const log = (strings, ...vars) => {
	console.log(
		strings
			.map( (v,i) => [v, vars[i]] )
			.reduce( (a,b) => a.concat(b) )
			.join('')
	)
}


export {
	log
}