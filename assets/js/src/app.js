window.addEventListener('load', function () {
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
            events: {},
            filteredEvents: {},
        },
        methods: {
            filterClick: function(event){
                var period = event.target.dataset.period;
                if(period){
                    this.applyFilter(period);
                }
            },
            applyFilter: function(period){
                var date = moment();
                var year = date.year();
                var month = date.month();
                var day = date.date();

                this.filteredEvents = {};

                switch(period){
                    case 'today':
                        this.filteredEvents[date.format("MMMM DD, YYYY")] = this.events[year][month][day].items;
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

                        for(var day in this.events[firstYear][firstMonth]){
                            day = parseInt(day);
                            var dayItem = this.events[firstYear][firstMonth][day];
                            var itemDate = dayItem.date;
                            if(day >= firstDay && (day <= lastDay || firstMonth != lastMonth)){
                                this.filteredEvents[itemDate.format("MMMM DD, YYYY")] = dayItem.items;
                            }
                        }
                        // Account for weeks that span 2 months
                        if(firstYear != lastYear || firstMonth != lastMonth){
                            for(var day in this.events[lastYear][lastMonth]){
                                day = parseInt(day);
                                var dayItem = this.events[lastYear][lastMonth][day];
                                var itemDate = dayItem.date;
                                if(day >= 1 && (day <= lastDay || firstMonth != lastMonth)){
                                    this.filteredEvents[itemDate.format("MMMM DD, YYYY")] = dayItem.items;
                                }
                            }
                        }
                        break;
                    case 'month':
                        for(var day in this.events[year][month]){
                            day = parseInt(day);
                            var dayItem = this.events[year][month][day];
                            var itemDate = dayItem.date;
                            this.filteredEvents[itemDate.format("MMMM DD, YYYY")] = dayItem.items;
                        }
                        break;
                    case 'year':
                        for(var currentMonth in this.events[year]){
                            var monthItem = this.events[year][currentMonth];
                            for(var day in monthItem){
                                var dayItem = this.events[year][currentMonth][day];
                                var itemDate = dayItem.date;
                                this.filteredEvents[itemDate.format("MMMM DD, YYYY")] = dayItem.items;
                            }
                        }
                        break;
                    default:
                        break;
                }
            }
        },
        created: function(){
            var sortedEvents = this.events;
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
