import React, {Fragment} from 'react';
import BaseComponent from "../../components/BaseComponent";

class TestContainer extends BaseComponent {

    constructor(props) {
        super(props)
        this.state = {}

        this.data = {}

        fetch('http://ws-npassive.tce.local/WhService.asmx', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/soap+xml; charset=utf-8'
            },
            body: `<?xml version="1.0" encoding="utf-8"?>
                        <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
                          <soap12:Header>
                            <AuthHeader xmlns="http://tempuri.org/">
                              <Username>npassive</Username>
                              <Password>Passive!@#$</Password>
                            </AuthHeader>
                          </soap12:Header>
                          <soap12:Body soapAction="http://tempuri.org/GetPassiveData">
                            <GetPassiveData xmlns="http://tempuri.org/" soapAction="http://tempuri.org/GetPassiveData"/>
                          </soap12:Body>
                        </soap12:Envelope>`
        })
    }


    componentDidMount() {
        setTimeout(() => {
            const jsreports = window.jsreports
            var orderData = [{
                "userId": "1X39AN4Z92Y",
                "userName": "John Smith",
                "accountType": "INDIVIDUAL",
                "orderTotal": 19.95,
                "orderDate": "2016-02-24"
            }, {
                "userId": "1AC43L30HR8",
                "userName": "Alison Jones",
                "accountType": "BUSINESS",
                "orderTotal": 180.50,
                "orderDate": "2016-02-25"
            }, {
                "userId": "1CM499NA94R",
                "userName": "Becky Sanderson",
                "accountType": "BUSINESS",
                "orderTotal": 85.00,
                "orderDate": "2016-02-27"
            }];

// A schema is used to assist the report designer and report engine to know
// about the data types used in the data source.
            var orderSchema = {
                fields: [{
                    name: "userId",
                    type: "text"
                }, {
                    name: "userName",
                    type: "text"
                }, {
                    name: "accountType",
                    type: "text"
                }, {
                    name: "orderTotal",
                    type: "number"
                }, {
                    name: "orderDate",
                    type: "date"
                }]
            };

            var dataSource = {
                id: "orders",   // Internal reference ID
                name: "Orders",  // Data source name shown to report designer
                data: orderData,
                schema: orderSchema
            };

// Create a report definition
            var report = jsreports.createReport()
                .data('orders') // The report will look for a data source with ID "orders"
                .groupBy('accountType', 'accountType', 'desc')
                .header(0.35)
                .text('[accountType] Accounts:')
                .footer(0.5)
                .text('Total: [SUM(orderTotal)]', 2, 0, 2, 0.25, {
                    pattern: '$#,##0.00',
                    align: 'right',
                    bold: true
                })
                .detail()
                .text('[userName]')
                .text('[orderDate]', 1.75, 0, 1, 0.25, {
                    pattern: 'M/D/YY'
                })
                .text('[orderTotal]', 3, 0, 1, 0.25, {
                    pattern: '$#,##0.00',
                    align: 'right'
                })
                .done();

// Render the report
            jsreports.render({
                report_def: report,
                target: document.body,
                datasets: [dataSource]
            });

            var designer = new jsreports.Designer({
                embedded: true,
                container: document.body,
                data_sources: [dataSource],
                images: [{
                    name: "ACME logo",
                    url: "images/acme-logo.png"
                }],
                report_def: report,
                layout: "horizontal"
            });

        }, 1000)
    }

    render() {

        return <div></div>
    }

}

export default TestContainer;