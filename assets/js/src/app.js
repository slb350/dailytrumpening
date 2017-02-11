window.addEventListener('load', function () {

    window.Event = new class {
        constructor(){
            this.vue = new Vue();
        }

        fire(event, data = null){
            this.vue.$emit(event, data);
        }

        listen(event, callback){
            this.vue.$on(event, callback);
        }
    }

    Vue.component('filters', {
        template: `
            <div>
                <ul class="nav navbar-nav" id="period">
                    <li v-for="filter in filters" :class="{ 'is-active' : filter.isActive }">
                        <a :href="filter.href" @click="filterClick(filter.period)" :class="{ 'active' : filter.isActive }">{{filter.title}}</a>
                    </li>
                </ul>
                <slot></slot>
            </div>
        `,
        data(){
            return {
                filters: [],
            }
        },
        mounted(){
        },
        created(){
            this.filters = this.$children;
        },
        methods: {
            filterClick: function(period){
                this.filters.forEach(function(currentFilter, index) {
                    currentFilter.isActive = (currentFilter.period == period);
                });
                Event.fire('filterApplied', period);
            }
        }
    });

    Vue.component('filter-item', {
        props: {
            period: {required: true},
            selected: {default: false},
        },
        mounted(){
            this.isActive = this.selected;
        },
        data(){
            return{
                isActive: false,
            }
        },
        template: '<span></span>',
        computed: {
            activeClass: function(){
                var cssClass = '';
                if(this.isActive){
                    cssClass = 'active';
                }
                return cssClass;
            },
            title: function(){
                var titleCased = this.period.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
                if(this.period != 'today'){
                    titleCased = 'This ' + titleCased;
                }
                return titleCased;
            },
            href: function(){
                return '#' + this.period;
            }
        },
        methods: {
            filterClick: function(period){
                Event.fire('filterApplied', period);
            }
        },
    })

    Vue.component('day', {
      template: '\
        <div>\
            <h2 class="u-textColor--black-light">{{ formattedDate }}</h2>\
            <ul class="c-list" style="list-style-type: disc;">\
                <daily-event v-for="event in items" v-bind:event="event"></daily-event>\
            </ul>\
        </div>\
      ',
      props: ['items', 'date'],
      computed: {
          formattedDate: function(){
              return moment(this.date).format("MMMM DD, YYYY");
          }
      }
    })

    Vue.component('daily-event', {
      template: '\
          <li class="c-list__item">\
            <a v-bind:href="event.url" target="_blank">{{ event.title }}</a>\
          </li>\
      ',
      props: ['event'],
    })

    var app = new Vue({
        el: "#app",
        data: {
            eventsFromSource: trumpenings,
            eventItems: {},
            filteredEvents: {},
        },
        computed: {
            filteredEventCount: function(){
                return Object.keys(this.filteredEvents).length;
            }
        },
        methods: {
            applyFilter: function(period){
                var parent = this;

                var date = moment();
                var year = date.year();
                var month = date.month();
                var day = date.date();

                this.filteredEvents = {};

                switch(period){
                    case 'today':
                        if(this.eventItems[year][month][day]){
                            this.filteredEvents[date.format("MMMM DD, YYYY")] = this.eventItems[year][month][day].items;
                        }
                        break;
                    case 'week':
                        var firstDate = moment(date).subtract(date.day(), 'days');
                        var firstYear = firstDate.year();
                        var firstMonth = firstDate.month();
                        var firstDay = firstDate.date();

                        var lastDate = moment(firstDate).add(6, 'days');
                        var lastYear = lastDate.year();
                        var lastMonth = lastDate.month();
                        var lastDay = lastDate.date();

                        for(var day in this.eventItems[firstYear][firstMonth]){
                            day = parseInt(day);
                            if(this.eventItems[firstYear][firstMonth][day]){
                                var dayItem = this.eventItems[firstYear][firstMonth][day];
                                var itemDate = dayItem.date;
                                if(day >= firstDay && (day <= lastDay || firstMonth != lastMonth)){
                                    this.filteredEvents[itemDate.format("MMMM DD, YYYY")] = dayItem.items;
                                }
                            }
                        }
                        // Account for weeks that span 2 months
                        if(firstYear != lastYear || firstMonth != lastMonth){
                            for(var day in this.eventItems[lastYear][lastMonth]){
                                day = parseInt(day);
                                if(this.eventItems[lastYear][lastMonth][day]){
                                    var dayItem = this.eventItems[lastYear][lastMonth][day];
                                    var itemDate = dayItem.date;
                                    if(day >= 1 && (day <= lastDay || firstMonth != lastMonth)){
                                        this.filteredEvents[itemDate.format("MMMM DD, YYYY")] = dayItem.items;
                                    }
                                }
                            }
                        }
                        break;
                    case 'month':
                        if(this.eventItems[year][month]){
                            for(var day in this.eventItems[year][month]){
                                day = parseInt(day);
                                var dayItem = this.eventItems[year][month][day];
                                var itemDate = dayItem.date;
                                this.filteredEvents[itemDate.format("MMMM DD, YYYY")] = dayItem.items;
                            }
                        }
                        break;
                    case 'year':
                        if(this.eventItems[year]){
                            for(var currentMonth in this.eventItems[year]){
                                var monthItem = this.eventItems[year][currentMonth];
                                for(var day in monthItem){
                                    var dayItem = this.eventItems[year][currentMonth][day];
                                    var itemDate = dayItem.date;
                                    this.filteredEvents[itemDate.format("MMMM DD, YYYY")] = dayItem.items;
                                }
                            }
                        }
                        break;
                    default:
                        break;
                }
            }
        },
        created: function(){
            Event.listen('filterApplied', function(period){
                app.applyFilter(period);
            });

            var sortedEvents = this.eventItems;
            for(var eventDate in trumpenings){
                var date = moment(eventDate);
                var year = date.year();
                var month = date.month();
                var day = date.date();
                if(!sortedEvents[year]){
                    sortedEvents[year] = {};
                }
                var yearlyEvents = sortedEvents[year];
                if(!yearlyEvents[month]){
                    yearlyEvents[month] = {};
                }
                var monthEvents = yearlyEvents[month];

                if(!monthEvents[day]){
                    monthEvents[day] = {};
                }
                var dayEvents = monthEvents[day];

                var sourceEvents = trumpenings[eventDate];
                sortedEvents[year][month][day] = {
                    date: date,
                    items: sourceEvents
                };
            }

            this.applyFilter('today');
        }

    })
})
