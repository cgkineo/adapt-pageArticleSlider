define([
	'coreJS/adapt',
	'coreViews/pageView'
], function(Adapt, AdaptPageView) {

	var ArticleSliderView = {

		events: {
			"click [data-article-slider]": "_onClick"
		},

		preRender: function() {
            AdaptPageView.prototype.preRender.call(this);
            if (this.model.isArticleSliderEnabled()) this._preRender();
        },

        render: function() {
			if (this.model.isArticleSliderEnabled()) this._render();
			else AdaptPageView.prototype.render.call(this);
		},

        _preRender: function() {
        	this._setupEventListeners();
		},

		_setupEventListeners: function() {
			this.onResize = _.bind(this._onResize, this);
			$(window).on("resize", this.onResize);
			this.listenTo(Adapt, "device:changed", this._onDeviceChanged);
			this.listenToOnce(Adapt, "remove", this._onRemove);
		},

		_removeEventListeners: function() {
			$(window).off("resize", this.onResize);
			this.stopListening(Adapt, "device:changed", this._onDeviceChanged);
		},

		_render: function() {
            Adapt.trigger(this.constructor.type + 'View:preRender', this);
          
            this._configureVariables();

            var data = this.model.toJSON();
            var template = Handlebars.templates['pageArticleSlider-page'];
            this.$el.html(template(data));

            this.addChildren();

            _.defer(_.bind(function() {
            	this._configureControls(false);
                Adapt.trigger(this.constructor.type + 'View:postRender', this);
                this._onDeviceChanged();
            }, this));

            return this;
		},

		_onClick: function(event) {
			event.preventDefault();

			var id = $(event.currentTarget).attr("data-article-slider");

			switch(id) {
			case "left":
				this._moveLeft();
				break;
			case "index":
				var index = parseInt($(event.currentTarget).attr("data-article-slider-index"));
				this._moveIndex(index);
				break;
			case "right":
				this._moveRight();
				break;
			}

		},

		_moveLeft: function() {
			if (this.model.get("_currentArticle") === 0) return;

			this.model.set("_currentArticle", this.model.get("_currentArticle")-1);

			this._resizeHeight();
			this._animateSlider();
			this._configureControls();
		},

		_moveIndex: function(index) {
			if (this.model.get("_currentArticle") == index) return;

			this.model.set("_currentArticle", index);

			this._resizeHeight();
			this._animateSlider();
			this._configureControls();
		},

		_moveRight: function() {
			if (this.model.get("_currentArticle") == this.model.get("_totalArticles") - 1 ) return;

			this.model.set("_currentArticle", this.model.get("_currentArticle")+1);

			this._resizeHeight();
			this._animateSlider();
			this._configureControls();
		},

		_animateSlider: function(animate) {
			var isEnabledOnMobile = this.model.get("_pageArticleSlider").isEnabledOnMobile || false;
			var $articleContainer = this.$el.find(".article-container");

			if (!isEnabledOnMobile && Adapt.device.screenSize == "medium") {
				return $articleContainer.css({left: ""});
			}

			var articles = this.$el.find(".article");
			var articleWidth = $(articles[0]).outerWidth();
			var totalLeft = this.model.get("_currentArticle") * articleWidth;

			var duration = this.model.get("_pageArticleSlider")._animationDuration || 200;

			if (animate === false) {
				$articleContainer.css({left: -totalLeft + "px"});
			} else {
				$articleContainer.velocity({left: -totalLeft + "px"}, {duration: duration, easing: "ease-in" });
			}

		},

		_configureVariables: function() {

			var totalArticles = this.model.getChildren().models.length;

			this.model.set("_currentArticle", 0);
			this.model.set("_totalArticles", totalArticles);

			var itemButtons = [];

			for (var i = 0, l = totalArticles; i < l; i++) {
				itemButtons.push({
					_className: i === 0 ? "icon-home" : "icon-circle",
					_index: i,
					_includeNumber: i != 0
				});
			}

			this.model.set("_itemButtons", itemButtons);
		},

		_configureControls: function(animate) {

			var duration = this.model.get("_pageArticleSlider")._animationDuration || 200;

			_.delay(_.bind(function() {

				var _currentArticle = this.model.get("_currentArticle");
				var _totalArticles = this.model.get("_totalArticles");

				var $left = this.$el.find("[data-article-slider='left']");
				var $right = this.$el.find("[data-article-slider='right']");

				if (_currentArticle === 0) {
					$left.a11y_cntrl_enabled(false);
					$right.a11y_cntrl_enabled(true);
				} else if (_currentArticle == _totalArticles - 1 ) {
					$left.a11y_cntrl_enabled(true);
					$right.a11y_cntrl_enabled(false);
				} else {
					$left.a11y_cntrl_enabled(true);
					$right.a11y_cntrl_enabled(true);
				}

				var $indexes = this.$el.find("[data-article-slider='index']");
				$indexes.a11y_cntrl_enabled(true).removeClass("selected");
				$indexes.eq(_currentArticle).a11y_cntrl_enabled(false).addClass("selected");

				var $articles = this.$el.find(".article");
				$articles.a11y_on(false).eq(_currentArticle).a11y_on(true);
				
			}, this), animate === false ? 0 : duration);

		},

		_resizeHeight: function(animate) {
			var $container = this.$el.find(".page-article-slider");
			var isEnabledOnMobile = this.model.get("_pageArticleSlider").isEnabledOnMobile || false;

			if (!isEnabledOnMobile && Adapt.device.screenSize == "medium") {
				return $container.css({"height": ""});
			}

			var _currentArticle = this.model.get("_currentArticle");
			var $articles = this.$el.find(".article");

			var currentHeight = $container.height();
			var articleHeight = $articles.eq(_currentArticle).height();

			var duration = (this.model.get("_pageArticleSlider")._animationDuration || 200) * 2;

			if (currentHeight <= articleHeight) {

				if (animate === false) {
					$container.css({"height": articleHeight+"px"});
				} else {
					$container.velocity({"height": articleHeight+"px"}, {duration: duration });//, easing: "ease-in"});
				}

			} else if (currentHeight > articleHeight) {

				if (animate === false) {
					$container.css({"height": articleHeight+"px"});
				} else {
					$container.velocity({"height": articleHeight+"px"}, {duration: duration });//, easing: "ease-in"});
				}

			}
		},

		_resizeWidth: function() {
			var isEnabledOnMobile = this.model.get("_pageArticleSlider").isEnabledOnMobile || false;
			var $articleContainer = this.$el.find(".article-container");

			if (!isEnabledOnMobile && Adapt.device.screenSize == "medium") {
				return $articleContainer.css({"width": "100%"});
			}

			var $container = this.$el.find(".page-article-slider");

			var $articles = this.$el.find(".article");
			$articles.css("max-width", $container.width()+"px");
				
			var articleWidth = $($articles[0]).outerWidth();
			var totalWidth = $articles.length * articleWidth;

			$articleContainer.width(totalWidth + "px");

		},

		_onResize: function() {
			
			this._resizeWidth(false);
			this._resizeHeight(false);
			this._animateSlider(false);

		},

		_onDeviceChanged: function() {
			this.$(".page-article-toolbar, .page-article-slider, .page-article-bottombar").removeClass("small medium large").addClass(Adapt.device.screenSize);

			_.delay(function() {
				$(window).resize();
			}, 250);
		},

		_onRemove: function() {
			this._removeEventListeners();
		}
	};

	return ArticleSliderView;

});