/*jslint plusplus: true, unparam: true*/
/*global $, ko*/

$(function () {
    'use strict';

    var console = window.console || { log: $.noop },
        dataSource = [],
        bigScroll = $('#big-scroll'),
        container = $('#big-scroll-container'),

        // Number of items to generate:
        totalItems = 200 * 1000,

        // Total items per page.
        // It's OK, to set to more items than fits on the screen.
        itemsPerPage = 30,

        // Single item height in px, must be exact:
        itemHeight = 40,

        // Total container height, so that it creates accureate scroll:
        totalHeight = totalItems * itemHeight,

        // Page height in px:
        pageHeight = itemsPerPage * itemHeight,

        // Number of total pages:
        totalPages = Math.ceil(totalHeight / pageHeight),

        // Storage for pre paginated pages:
        pages = [],

        // Main view model:
        model = {
            pages: ko.observableArray(),
            page: ko.observable(-1),
            previous: ko.observable(-1),
            scrollTop: 0,
            toggleState: ko.observable(false)
        };

    console.log('Total pages: ' + totalPages);

    // Adjust container height:
    container.height(totalItems * itemHeight);

    // Trigerred during scroll:
    model.onScroll = function () {
        var index = Math.floor(bigScroll.scrollTop() / pageHeight);
        model.page(index);
    };

    // Toggle all checkboxes:
    model.toggleState.subscribe(function (checked) {
        $.each(dataSource, function (n, obj) {
            obj.checked(checked);
        });
    });

    // Paging, all magic happens, when page changes:
    model.page.subscribe(function (index) {
        // Verfies if pages already has item with selected index:
        function containsPage(pageIndex) {
            var found = false;
            $.each(model.pages(), function (k, obj) {
                if (obj.index === pageIndex) {
                    found = true;
                }
            });
            return found;
        }

        var nextPage = pages[index + 1];

        // Add currently visible page:
        if (!containsPage(index)) {
            model.pages.push(pages[index]);
        }

        // Add next page:
        if (nextPage && !containsPage(index + 1)) {
            model.pages.push(nextPage);
        }

        // Remove pages that are not current and next:
        model.pages.remove(function (obj) {
            return !(obj.index === index || obj.index === index + 1);
        });
    });

    // Generate fake items in the data source:
    (function () {
        function generateModel(index) {
            var obj = {
                id: index,
                label: 'Hello ' + index,
                checked: ko.observable(index % 3 === 0)
            };

            obj.checked.subscribe(function (value) {
                // console.log((arguments[0] ? 'Checked' : 'Unchecked') + ' ' + obj.id);
            });

            return obj;
        }

        var i;
        for (i = 1; i <= totalItems; i++) {
            dataSource.push(generateModel(i));
        }
    }());

    // Initialize pages:
    (function () {
        function getItemsForPage(index) {
            var pageItems = [],
                item,
                j;

            for (j = index * itemsPerPage; j < (index + 1) * itemsPerPage; j++) {
                item = dataSource[j];
                if (!item) {
                    break;
                }
                pageItems.push(item);
            }

            return pageItems;
        }

        var items, i;
        for (i = 0; i < totalPages; i++) {
            items = getItemsForPage(i);
            // console.log((itemsPerPage * itemHeight * i) + 'px');
            pages.push({
                index: i,
                items: items,
                height: (items.length * itemHeight) + 'px',
                top: (itemsPerPage * itemHeight * i) + 'px'
            });
        }
    }());

    // Initialize first page:
    model.page(0);

    // Do the magic:
    ko.applyBindings(model);
});

