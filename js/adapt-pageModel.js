define([
	'coreJS/adapt'
], function(Adapt) {

	var ArticleSliderModel = {

		isArticleSliderEnabled: function() {
			return this.get("_pageArticleSlider") && this.get("_pageArticleSlider")._isEnabled;
		}

	};

	return ArticleSliderModel;
});
