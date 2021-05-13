let client = new WebTorrent()

document.addEventListener('DOMContentLoaded', () => {
	const fileInput = getEl('#upload');
	const downloadBTN = getEl('.download > button');
	const downloadInput = getEl('#download');
	handleUpload(fileInput);
	downloadBTN.onclick = () => { 
		if (downloadInput.value === '') return;
		handleDownload(downloadInput.value);
	 }
	 handleURL();
});
/**
 * handle download from the client
 * @param {String} magnetID 
 */
function handleDownload(magnetID) {
	client.add(magnetID, { path: '/' }, function (torrent) {
		torrent.on('done', function () {
			torrent.files.forEach(file => {
				file.getBlobURL(function (err, url) {
					if (err) return log(err.message)
					console.log('File done.')
					injectFileLink('<a target="_blank" download="'+ file.name +'" href="' + url + '">Download full file: ' + file.name + '</a>')
				})
			})
		})
	})
}
/**
 * Inject links with the blob files
 * @param {String} link Anchor link
 */
function injectFileLink(link) {
	const wrapper = getEl('#download-links');
	wrapper.innerHTML += link;
}

/**
 * Handle upload
 * @param {HTMLElement} fileInput Input element
 */
function handleUpload(fileInput) {
	const mainBtn = getEl('.upload-action');
	const magnetShow = getEl('.magnet-show');
	const cpBtn = getEl('.upload button.cp');
	const shareBtn = getEl('.upload button.share');
	const sharelink = getEl('.magnet-link');
	fileInput.onchange = function () {
		// seed all files
		client.seed(this.files, function (torrent) {
			console.log('Client is seeding ' + torrent.magnetURI)
			magnetShow.value = torrent.magnetURI;
			sharelink.value = document.location.href + "#" + btoa(torrent.magnetURI);
		});
		// magnet copy
		cpBtn.onclick = () => {
			magnetShow.select();
			magnetShow.setSelectionRange(0, 99999); /* For mobile devices */
			/* Copy the text inside the text field */
			document.execCommand("copy");
			console.log(`copy: ${magnetShow.value}`);
		}
		// share link copy
		shareBtn.onclick = () => {
			sharelink.select();
			sharelink.setSelectionRange(0, 99999); /* For mobile devices */
			/* Copy the text inside the text field */
			document.execCommand("copy");
			console.log(`copy: ${sharelink.value}`);
		}
	}
	mainBtn.onclick = () => { fileInput.click() }
}
/**
 * Handle sharable link
 */
function handleURL () {
	let hash = document.location.hash;
	if (hash !== '') {
		hash = hash.replace('#', '');
		handleDownload(atob(hash))
	}
}

/**
 * Return query selector node
 * @param {String} query Query selector string
 * @returns Node Elements
 */
function getEl(query) {
	return document.querySelector(query)
}
/**
 * Add it to HTMLElement prototype
 * @param {String} query Query selector string
 * @returns Node Element
 */
HTMLElement.prototype.getEl = function (query) {
	return this.querySelector(query);
}
