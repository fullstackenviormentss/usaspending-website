function convertObjectToArray(input) {
    return Object.keys(input)
        .map((key) => input[key]);
}

const migration = {
    next: null, // this is the first migration
    inboundVersion: '2017-11-21', // version we are migrating from
    migrate(data) {
        let inboundFilters = data.filters;
        if (data.version !== this.inboundVersion) {
            if (this.next) {
                // use an earlier migration to bring it up to the inbound version
                inboundFilters = this.next.migrate(data);
            }
            else {
                // bad input, return a blank set of data
                return {
                    filters: {},
                    view: {
                        activeTab: 'table',
                        subaward: false
                    }
                };
            }
        }
        const filters = {
            awardType: inboundFilters.filtersawardType || []
        };

        // keyword has been adapted to an array
        if (inboundFilters.filterskeyword) {
            filters.keyword = [inboundFilters.keyword];
        }

        // time period is a child object
        filters.timePeriod = {
            type: inboundFilters.timePeriodType,
            value: []
        };
        // time period values have been combined into a single value array
        if (inboundFilters.timePeriodType === 'fy') {
            filters.timePeriod.value = inboundFilters.timePeriodFY || [];
        }
        else {
            filters.timePeriod.value = [
                inboundFilters.timePeriodStart || null,
                inboundFilters.timePeriodEnd || null
            ];
        }

        // convert location objects to arrays of objects
        if (inboundFilters.selectedLocations) {
            filters.location = convertObjectToArray(inboundFilters.selectedLocations);
        }

        // do the same conversion for funding and awarding agencies
        if (inboundFilters.selectedFundingAgencies) {
            filters.fundingAgency = convertObjectToArray(inboundFilters.selectedFundingAgencies);
        }
        if (inboundFilters.selectedAwardingAgencies) {
            filters.awardingAgency = convertObjectToArray(inboundFilters.selectedAwardingAgencies);
        }

        // in previous versions, there was no search view, so use a stock set of values
        const view = {
            activeTab: 'table',
            subaward: false
        };

        return {
            filters,
            view
        };
    }
};

export default migration;
