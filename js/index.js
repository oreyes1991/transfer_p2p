let client = new WebTorrent();
const MBVALUE = 1048576;

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
	openModal();
	client.add(magnetID, { path: '/' }, function (torrent) {
		handleInfo(torrent)
		torrent.on('download', (bytes) => {
			writeProgress(torrent.progress)
		});
		torrent.on('done',async function () {
			await fileToBlobURL(torrent.files);
			modalDone();
		})
	})
}
/**
 * Convert files to blob url to be download
 * @param {Array} files Array of files
 * @returns promise
 */
function fileToBlobURL(files) {
	return new Promise((resolve, reject) => {
		files.forEach((file, i) => {
			file.getBlobURL(function (err, url) {
				if (err) reject(err.message);
				console.log('File done.')
				injectFileLink('<a target="_blank" download="'+ file.name +'" href="' + url + '">' + file.name + '</a>');
				if ((files.length - 1) === i) resolve();
			})
		})
	})
}
/**
 * 
 * @param {Boolean} state 
 */
function openModal() {
	const modal = getEl('#main-modal');
	modal.classList.remove('hidden');
}
/**
 * Write progress to modal
 * @param {Float} percent progress from webtorrent
 */
function writeProgress (percent) {
	const progress = getEl('#progress');
	progress.innerHTML = (percent * 100).toFixed(0);
}
/**
 * Inject links with the blob files
 * @param {String} link Anchor link
 */
function injectFileLink(link) {
	const wrapper = getEl('#download-links');
	const p =  wrapper.querySelectorAll('p:not(.hidden)');
	p.forEach(el => {
		el.classList.add('hidden');
	})
	wrapper.innerHTML += link;
}
/**
 * 
 */
function modalDone() {
	const title = getEl('#main-modal .title');
	const actions = getEl('#main-modal .actions');
	title.innerHTML = 'Your Files are done.';
	actions.classList.remove('hidden');
	const dwAll = getEl('#dw-all');
	const close = getEl('#close');
	dwAll.onclick = () => {
		const links = document.querySelectorAll('#download-links > a');
		links.forEach(l => {
			l.click();
		})
	}
	close.onclick = () => {
		document.location.reload();
	}
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
			cpBtn.classList.remove('hide');
			shareBtn.classList.remove('hide');
			handleInfo(torrent)
		});
		// magnet copy
		cpBtn.onclick = () => {
			manageCopy(magnetShow);
		}
		// share link copy
		shareBtn.onclick = () => {
			manageCopy(sharelink)
		}
	}
	mainBtn.onclick = () => { fileInput.click() }
}
/**
 * display conection info
 * @param {Object} torrent observable torrent object
 * @returns Interval
 */
function handleInfo(torrent) {
	const nPeersEl = getEl('#peer-count');
	const dSpeedEl = getEl('#download-speed');
	const uSpeedEl = getEl('#upload-speed');
	const wrapper = getEl('#info-wrapper');
	wrapper.classList.remove('away');
	const _convert = (val) => { return ( val / MBVALUE ).toFixed(3) }
	const _write = (nPeers, dSpeed, uSpeed) => {
		nPeersEl.innerHTML = nPeers;
		dSpeedEl.innerHTML = _convert(dSpeed);
		uSpeedEl.innerHTML = _convert(uSpeed);
	}
	_write(torrent.numPeers, torrent.downloadSpeed, torrent.uploadSpeed);
	return setInterval(() => {
		_write(torrent.numPeers, torrent.downloadSpeed, torrent.uploadSpeed)
	}, 5000)
}

/**
 * Copy to clipboard
 * @param {HTMLInputElement} input 
 */
function manageCopy (input) {
	input.select();
	input.setSelectionRange(0, 99999); /* For mobile devices */
	/* Copy the text inside the text field */
	document.execCommand("copy");
	console.log(`copy: ${input.value}`);
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
