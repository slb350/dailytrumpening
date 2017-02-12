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
            <a v-bind:href="event.url" target="_blank" v-html="event.title"></a>\
          </li>\
      ',
      props: ['event'],
    })

    var app = new Vue({
        el: "#app",
        data: {
            eventItems: [],
            filteredEvents: [],
            sortOrder: 'desc',
            startDate: moment(),
            endDate: moment(),
            selectedFilter: 'today',
            filters: [
                {"period" : "today", "title" : "Today"},
                {"period" : "week", "title" : "This Week"},
                {"period" : "month", "title" : "This Month"},
                {"period" : "year", "title" : "This Year"},
                {"period" : "custom", "title" : "Date Range"},
            ]
        },
        computed: {
            filteredEventCount: function(){
                return Object.keys(this.filteredEvents).length;
            }
        },
        methods: {
            applyFilter: function(){
                var app = this;

                var date = moment();
                var year = date.year();
                var month = date.month();
                var week = date.week();

                this.filteredEvents = [];
                switch(this.selectedFilter){
                    case 'today':
                        this.filteredEvents = this.eventItems.filter(function(val){
                            return val.date.isSame(date, 'd');
                        });
                        break;
                    case 'week':
                        this.filteredEvents = this.eventItems.filter(function(val){
                            return val.date.week() == week && val.date.year() == year;
                        });
                        break;
                    case 'month':
                        this.filteredEvents = this.eventItems.filter(function(val){
                            return val.date.month() == month && val.date.year() == year;
                        });
                        break;
                    case 'year':
                        this.filteredEvents = this.eventItems.filter(function(val){
                            return val.date.year() == year;
                        });
                        break;
                    case 'custom':
                        app.filteredEvents = app.eventItems.filter(function(val){
                            if(app.startDate.isSame(app.endDate)){
                                return val.date.isSame(date, 'd');
                            }
                            return val.date.isBetween(app.startDate, app.endDate);
                        });
                    break;
                    default:
                        break;
                }
                app.sortItems();
            },
            sortItems: function(){
                app.filteredEvents.sort(function(a,b){
                    var dateA = moment(a.date);
                    var dateB = moment(b.date);

                    if(app.sortOrder == 'desc'){
                        if(dateA.isBefore(dateB)) {return 1;}
                        if(dateB.isBefore(dateA)) {return -1;}
                    }
                    if(dateA.isBefore(dateB)) {return -1;}
                    if(dateB.isBefore(dateA)) {return 1;}
                });
            }

        },
        created: function(){
            // Get Events data
            $.ajax({
                url: "data/trumpenings.json",
            }).done(function(data){

                var trumpenings = data? data : [];

                // Build out an array of objects for all dates and their associated articles/items
                for(var eventDate in trumpenings){
                    var date = moment(eventDate);
                    var sourceEvents = trumpenings[eventDate];

                    app.eventItems.push({
                        "date" : date,
                        "items" : sourceEvents,
                    });
                }
                app.applyFilter();
            });
        },
        mounted: function(){
            var app = this;
            $('#daterange').daterangepicker();
            $('#daterange').on('apply.daterangepicker', function(ev, picker) {
                app.startDate = picker.startDate;
                app.endDate = picker.endDate;
                app.applyFilter();
            });
        }

    })
})
