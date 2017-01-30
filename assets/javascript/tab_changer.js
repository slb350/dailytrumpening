$(function() {
	// Grab the title of our document
  	var docTitle = $("title").text();

	// Target tab change (blue event) and throw in "unfocused" state text
	$(window).blur(function() {
	  $("title").text("Trumpening Continues");
	});

	// Revert back to the original title when focus is back on our window
	$(window).focus(function() {
	  $("title").text(docTitle);
	});
});
