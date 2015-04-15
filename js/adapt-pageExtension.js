define([
	'coreJS/adapt',
	'coreViews/pageView',
	'coreModels/contentObjectModel',
	'./adapt-pageView',
	'./adapt-pageModel'
], function(Adapt, PageView, PageModel, PageViewExtension, PageModelExtension) {

	/*	
		Here we are extending the pageView and pageModel in Adapt.
		This is to accomodate the article slider functionality on the page.
		The advantage of this method is that the article slider behaviour can utilize all of the predefined page behaviour in both the view and the model.
	*/	

	//Extends core/js/views/pageView.js
	var PageViewInitialize = PageView.prototype.initialize;
	PageView.prototype.initialize = function(options) {
		if (this.model.get("_pageArticleSlider")) {
			//extend the pageView with new functionality
			_.extend(this, PageViewExtension);
		}
		//initialize the page in the normal manner
		return PageViewInitialize.apply(this, arguments);
	};

	//Extends core/js/models/pageModel.js
	var PageModelInitialize = PageModel.prototype.initialize;
	PageModel.prototype.initialize = function(options) {
		if (this.get("_pageArticleSlider")) {
			//extend the pageModel with new functionality
			_.extend(this, PageModelExtension);

			//initialize the page in the normal manner
			var returnValue = PageModelInitialize.apply(this, arguments);

			return returnValue;
		}

		//initialize the page in the normal manner if no slider
		return PageModelInitialize.apply(this, arguments);
	};

});