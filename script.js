const schemaTypes = [
    'LocalBusiness', 'Organization', 'Service', 'Product', 'Offer',
    'Review', 'AggregateRating', 'Person', 'PostalAddress',
    'GeoCoordinates', 'OpeningHoursSpecification', 'ImageObject', 'VideoObject',
    'FAQPage', 'WebPage', 'Article', 'BlogPosting', 'JobPosting', 'Event', 'PriceSpecification',
    'ServiceArea'
];

const schemaInputs = {
    LocalBusiness: ['name', 'description', 'telephone', 'email', 'url', 'logo', 'priceRange'],
    Organization: ['name', 'description', 'url', 'logo', 'foundingDate'],
    Service: ['name', 'description', 'provider', 'areaServed', 'price', 'priceCurrency'],
    Product: ['name', 'description', 'brand', 'sku', 'price', 'priceCurrency'],
    Offer: ['name', 'description', 'price', 'priceCurrency', 'validFrom', 'validThrough'],
    Review: ['reviewBody', 'ratingValue', 'author', 'datePublished'],
    AggregateRating: ['ratingValue', 'bestRating', 'worstRating', 'ratingCount'],
    Person: ['name', 'jobTitle', 'telephone', 'email'],
    PostalAddress: ['streetAddress', 'addressLocality', 'addressRegion', 'postalCode', 'addressCountry'],
    GeoCoordinates: ['latitude', 'longitude'],
    OpeningHoursSpecification: ['dayOfWeek', 'opens', 'closes'],
    ImageObject: ['url', 'caption', 'width', 'height'],
    VideoObject: ['url', 'description', 'thumbnailUrl', 'uploadDate', 'duration'],
    FAQPage: ['question', 'answer'],
    WebPage: ['name', 'description', 'url'],
    Article: ['headline', 'articleBody', 'datePublished', 'author'],
    BlogPosting: ['headline', 'articleBody', 'datePublished', 'author'],
    JobPosting: ['title', 'description', 'datePosted', 'validThrough', 'salary', 'employmentType'],
    Event: ['name', 'description', 'startDate', 'endDate', 'location', 'eventStatus'],
    PriceSpecification: ['priceType', 'priceCurrency', 'price', 'minPrice', 'maxPrice'],
    ServiceArea: ['type', 'name', 'description', 'geoMidpoint', 'geoRadius', 'addressCountry', 'addressRegion', 'addressLocality', 'postalCode']
};

function createInputs() {
    const container = document.getElementById('schemaInputs');
    Object.entries(schemaInputs).forEach(([schema, fields]) => {
        const section = document.createElement('div');
        section.className = 'schema-section';
        section.id = `${schema}Section`;

        const title = document.createElement('h3');
        title.textContent = schema;
        section.appendChild(title);

        fields.forEach(field => {
            const label = document.createElement('label');
            label.textContent = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

            const input = document.createElement('input');
            input.type = 'text';
            input.id = `${schema}_${field}`;

            label.appendChild(input);
            section.appendChild(label);
        });

        container.appendChild(section);
    });
}

function createCheckboxes() {
    const container = document.getElementById('schemaCheckboxes');
    schemaTypes.forEach(schema => {
        const label = document.createElement('label');
        label.style.display = 'flex';
        label.style.alignItems = 'center';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = schema;

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(schema));
        container.appendChild(label);
    });
}

function generateSchema() {
    const selectedSchemas = Array.from(document.querySelectorAll('#schemaCheckboxes input:checked')).map(cb => cb.value);
    const schema = {
        "@context": "https://schema.org",
        "@graph": []
    };

    selectedSchemas.forEach(type => {
        const entity = {
            "@type": type
        };
        const fields = schemaInputs[type];
        fields.forEach(field => {
            const value = document.getElementById(`${type}_${field}`).value;
            if (value) {
                if (type === 'ServiceArea' && field === 'geoMidpoint') {
                    const [latitude, longitude] = value.split(',').map(v => v.trim());
                    entity[field] = {
                        "@type": "GeoCoordinates",
                        "latitude": latitude,
                        "longitude": longitude
                    };
                } else if (type === 'ServiceArea' && field === 'geoRadius') {
                    entity[field] = value + " km";
                } else {
                    entity[field] = value;
                }
            }
        });
        schema["@graph"].push(entity);
    });

    document.getElementById('schemaOutput').textContent = JSON.stringify(schema, null, 2);
    document.getElementById('output').style.display = 'block';
}

function downloadSchema(format) {
    const schema = document.getElementById('schemaOutput').textContent;
    const blob = new Blob([schema], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business_schema.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', () => {
    createInputs();
    createCheckboxes();

    document.getElementById('generateBtn').addEventListener('click', generateSchema);
    document.getElementById('downloadJsonBtn').addEventListener('click', () => downloadSchema('json'));
    document.getElementById('downloadTxtBtn').addEventListener('click', () => downloadSchema('txt'));

    document.getElementById('schemaCheckboxes').addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const section = document.getElementById(`${e.target.value}Section`);
            if (section) {
                section.classList.toggle('active', e.target.checked);
            }
            if (e.target.value === 'ServiceArea') {
                document.getElementById('serviceAreaHelp').style.display = e.target.checked ? 'block' : 'none';
            }
        }
    });

    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            } 
        });
    }
});
