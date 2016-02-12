export default function() {
    if( window.XMLHttpRequest ) {
        return window.XMLHttpRequest;
    }
	try {
		return new ActiveXObject("Msxml2.XMLHTTP.6.0");
	} catch(e1) {}
	try {
		return new ActiveXObject("Msxml2.XMLHTTP.3.0");
	} catch(e2) {}
	try {
		return new ActiveXObject("Msxml2.XMLHTTP");
	} catch(e3) {}
	throw new Error("This browser does not support XMLHttpRequest.");
};
