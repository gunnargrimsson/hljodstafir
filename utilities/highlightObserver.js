console.log('Highlight Observer Active');
/* Grab all the spans (sentences within paragraphs) */
const spans = document.querySelectorAll('span');
/* We only really care for mutations to attributes */
const options = { attributes: true };
/* Keep track of the last parent node to be highlighted */
let lastParentNode = null;

/*
  For each mutation (add, remove) from class list
  we can check whether or not to remove/add the media overlay class
  from the parent element
*/
const mutationCallback = (mutationList, observer) => {
	mutationList.forEach((mutation) => {
		if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
			const parentNode = mutation.target.parentNode;
			if (mutation.target.classList.contains('-epub-media-overlay-active')) {
				if (lastParentNode !== null) {
					lastParentNode.classList.remove('-epub-media-overlay-active-parent');
				}
				lastParentNode = parentNode;
				if (parentNode.children.length <= 1) {
					return;
				}
				parentNode.classList.add('-epub-media-overlay-active-parent');
			} else {
				if (parentNode !== null) {
					parentNode.classList.remove('-epub-media-overlay-active-parent');
				}
			}
		}
	});
};

/* Start the MutationObserver */
const observer = new MutationObserver(mutationCallback);

/* Make sure each span with the sentence class is being observed */
spans.forEach((span) => {
	if (span.classList.contains('sentence')) {
		observer.observe(span, options);
	}
});
