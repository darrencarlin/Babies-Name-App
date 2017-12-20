$(document).ready(function () {
    $(".back-to-top").attr("style", "display: none !important");
    $.LoadingOverlay("show", {
        image: "",
        fontawesome: "fa fa-spinner fa-pulse fa-3x fa-fw"
    });
    setTimeout(function () {
        $.LoadingOverlay("hide");
    }, 1000);


    var urlBoys = "http://www.cso.ie/jsonFiles/vsa05.json";
    var urlGirls = "http://www.cso.ie/jsonFiles/vsa12.json";
    var availableNamesBoys = [];
    var availableNamesGirls = [];
    var availableNamesBoysIds = [];
    var availableNamesGirlsIds = [];
    var availableNamesBoysRandom = [];
    var availableNamesGirlsRandom = [];
    var availableNamesIds = [];
    var dsBoys;
    var dsGirls;
    var boysYears;
    var girlsYears;
    var boysNumYears;
    var girlsNumYears;
    var latestRank;
    var latestNumBirths;
    var yearsArrayBoys = [];
    var yearsArrayGirls = [];
    var numNamesBoys;
    var numNamesGirls;
    var girlsNames;
    var boysNames;
    var color;
    var sex;
    var boyTable;
    var girlTable;
    var threshold = 10;
    var latestYearBoys;
    var latestYearGirls;
    $("#pageTitle, #startYear, #endYear").hide()
    // Get JSON for boys & girls

    $.when($.getJSON(urlBoys, function (obj) {
        dsBoys = JSONstat(obj);
        dsBoys = dsBoys.Dataset(0);
        boysNames = dsBoys.Dimension("Name");
        numNamesBoys = boysNames.length;
        boysYears = dsBoys.Dimension("Year");
        boysNumYears = boysYears.length;
        latestYearBoys = boysYears.id[boysNumYears - 1];
        $("#startYear").text(boysYears.id[0]);
        $("#endYear").text(boysYears.id[boysNumYears - 1]);
        for (i = 0; i < numNamesBoys; i++) {

            availableNamesBoys.push(boysNames.Category(i).label);
            availableNamesBoysIds.push(boysNames.id[i]);
            var counter = 0;
            // if name[i] occurs in more than x years
            for (x = 0; x < boysNumYears; x++) {






                if (counter >= threshold) {
                    availableNamesBoysRandom.push(boysNames.Category(i).label);

                    break
                }
                // check the number of occurences of i in x
                var numBirths = dsBoys.Data({
                    "Statistic": "VSA05C01",
                    "Year": boysYears.id[x],
                    "Name": boysNames.id[i]
                }).value;
                if (numBirths !== null) {
                    counter++;
                }
            }
        };

        // page load populate years array for boys and girls
        for (i = 0; i < boysNumYears; i++) {
            yearsArrayBoys.push(parseInt(boysYears.id[i]));
        };
        renderDataTables("boy", latestYearBoys, true);

    }), $.getJSON(urlGirls, function (obj) {
        dsGirls = JSONstat(obj);
        dsGirls = dsGirls.Dataset(0);
        girlsNames = dsGirls.Dimension("Name");
        numNamesGirls = girlsNames.length;
        girlsYears = dsGirls.Dimension("Year");
        girlsNumYears = girlsYears.length;
        latestYearGirls = girlsYears.id[girlsNumYears - 1];
        // page load autocomplete for boys and girls
        for (i = 0; i < numNamesGirls; i++) {

            availableNamesGirls.push(girlsNames.Category(i).label);
            availableNamesGirlsIds.push(girlsNames.id[i]);
            var counter = 0;
            // if name[i] occurs in more than x years
            for (x = 0; x < girlsNumYears; x++) {



                if (counter >= threshold) {
                    availableNamesGirlsRandom.push(girlsNames.Category(i).label);

                    break
                }
                // check the number of occurences of i in x
                var numBirths = dsGirls.Data({
                    "Statistic": "VSA12C01",
                    "Year": girlsYears.id[x],
                    "Name": girlsNames.id[i]
                }).value;
                if (numBirths !== null) {
                    counter++;
                }
            }


        };
        for (i = 0; i < girlsNumYears; i++) {
            yearsArrayGirls.push(parseInt(girlsYears.id[i]));
        };

        renderDataTables("girl", latestYearGirls, true);

    }).then(function () {
        $.LoadingOverlay("hide");
        initScroll();
        $("#pageTitle, #startYear, #endYear").show();
    }));

    // Initially hide steps

    $(".form-name, .form-name-output, .form-year, .form-year-title, #tableContainerBoy, #tableContainerGirl").hide();

    // Choose Boy

    $("#boy").on("click touch", function () {

        $("#label-year").text("Top Boys Names");
        $("#loading").hide();
        color = "#91cef6";
        sex = "boy";
        populateAutoComplete(sex);
        populateYearsDropdown(sex);
        $(".form-year-title, #highchart-container, #latestFigures, #tableContainerGirl").hide();
        $("#name-input").val("")
        $(".form-year, .form-year-title, .form-name, #tableContainerBoy").fadeIn();
        $("#girl ~ label").addClass("opacity");
        $("#boy ~ label").removeClass("opacity");
        $("#loading").addClass("bg1");
        $("#loading").removeClass("bg2");
        $(".form-name, .form-gender, .form-name-output, .form-year, .form-year-title").css("background-color", color);
        $("#loading").fadeIn();
        $("#name-input").focus();
    });

    // Choose Girl

    $("#girl").on("click touch", function () {

        $("#label-year").text("Top Girls Names");
        $("#loading").hide();
        color = "#ffc8de";
        sex = "girl";
        populateAutoComplete(sex);
        populateYearsDropdown(sex);
        $(".form-year-title, #highchart-container, #latestFigures, #tableContainerBoy").hide();
        $("#name-input").val("");
        $(".form-year, .form-year-title, .form-name, #tableContainerGirl").fadeIn();
        $("#boy ~ label").addClass("opacity");
        $("#girl ~ label").removeClass("opacity");
        $("#loading").addClass("bg2");
        $("#loading").removeClass("bg1");
        $(".form-name, .form-gender, .form-name-output, .form-year, .form-year-title").css("background-color", color);
        $("#loading").fadeIn();
        $("#name-input").focus();
    });

    // Populate auto complete

    function populateAutoComplete(sex) {
        var namesArray;
        if (sex == "boy") {
            namesArray = availableNamesBoys;
        } else {
            namesArray = availableNamesGirls;
        }
        $("#name-input").autocomplete({
            autoFocus: true,
            source: function (request, response) {
                var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(request.term), "i");
                response($.grep(namesArray, function (item) {
                    return matcher.test(item);
                }));
            }
        }).keyup(function (e) {
            if (e.which === 13) {
                submit();
                $(".ui-menu-item").hide();
            }

        });

    }

    // Populate years dropdown

    function populateYearsDropdown(sex) {

        var yearsArray;

        if (sex === "boy") {
            yearsArray = yearsArrayBoys;

        } else {
            yearsArray = yearsArrayGirls;

        }
        $('#selectYearBoys, #selectYearGirls, #selectYearName').empty();
        for (var i = yearsArray.length - 1; i >= 0; i--) {

            $('#selectYearBoys, #selectYearGirls, #selectYearName').append($('<option>', {
                value: yearsArray[i],
                text: yearsArray[i]
            }));
        }
    }

    function renderResultByYear(sex, name, year) {

        var dataSet;
        var statisticNumber;
        var statisticRank;
        var availableNamesId;
        var availableNames;
        if (sex === "boy") {
            dataSet = dsBoys;
            statisticNumber = "VSA05C01";
            statisticRank = "VSA05C02";
            availableNamesId = availableNamesBoysIds;
            yearsArray = yearsArrayBoys;
            availableNames = availableNamesBoys;
        } else {
            dataSet = dsGirls;
            statisticNumber = "VSA12C01";
            statisticRank = "VSA12C02";
            availableNamesId = availableNamesGirlsIds;
            yearsArray = yearsArrayGirls;
            availableNames = availableNamesGirls;
        }
        var rankArray = [];
        var numBirthsArray = [];
        var selectedName = name;
        var positionInArray = jQuery.inArray(selectedName, availableNames);
        var selectedNameId = availableNamesId[positionInArray];
        latestRank = dataSet.Data({
            "Statistic": statisticRank,
            "Year": year,
            "Name": selectedNameId
        }).value;
        latestNumBirths = dataSet.Data({
            "Statistic": statisticNumber,
            "Year": year,
            "Name": selectedNameId
        }).value;

        if (latestRank == null || latestNumBirths == null) {

            $("#p1").show();
            $("#p2, #p3, #certButton").hide();
            $(".pYear").text(year);
            $(".pSex").text(sex);
            $(".pName").text(selectedName);
            $("#buttonName").text(selectedName);

        } else {

            $("#p1").hide();
            $("#p2,#p3, #certButton").show();
            $("#certButton").text("Generate Name Certificate for " + selectedName + " for " + year);
            $("#dl-pdf").text("Download Certificate");
            $("#certButton, #dl-pdf").append("<i class=\"fa fa-file-pdf-o fa-2x\" aria-hidden=\"true\"><\/i>");

            $("#buttonName").text(selectedName);
            $(".pName").text(selectedName);
            $(".pYear").text(year);
            $(".pTotal").text(latestNumBirths);
            $(".pSex").text(sex);
            $(".pRank").text(latestRank);
            $(".pName").text(selectedName);

        }

    };

    // Highcharts rendering

    function renderResult(sex, name) {

        var dataSet;
        var statisticNumber;
        var statisticRank;
        var availableNamesId;
        var availableNames;
        var yearsSex;
        var numYearsSex;
        if (sex === "boy") {
            dataSet = dsBoys;
            statisticNumber = "VSA05C01";
            statisticRank = "VSA05C02";
            availableNamesId = availableNamesBoysIds;
            yearsArray = yearsArrayBoys;
            availableNames = availableNamesBoys;
            yearsSex = boysYears;
            numYearsSex = boysNumYears;
        } else {
            dataSet = dsGirls;
            statisticNumber = "VSA12C01";
            statisticRank = "VSA12C02";
            availableNamesId = availableNamesGirlsIds;
            yearsArray = yearsArrayGirls;
            availableNames = availableNamesGirls;
            yearsSex = girlsYears;
            numYearsSex = girlsNumYears;
        }
        var rankArray = [];
        var numBirthsArray = [];
        var selectedName = name;
        var positionInArray = jQuery.inArray(selectedName, availableNames);
        var selectedNameId = availableNamesId[positionInArray];
        //get latest rank and numBirths
        var latestRank = dataSet.Data({
            "Statistic": statisticRank,
            "Year": yearsSex.id[numYearsSex - 1],
            "Name": selectedNameId
        }).value;
        var latestNumBirths = dataSet.Data({
            "Statistic": statisticNumber,
            "Year": yearsSex.id[numYearsSex - 1],
            "Name": selectedNameId
        }).value;

        //build highchart
        for (i = 0; i < numYearsSex; i++) {
            var rank = dataSet.Data({
                "Statistic": statisticRank,
                "Year": yearsSex.id[i],
                "Name": selectedNameId
            }).value
            rankArray.push(rank);
            var numBirths = dataSet.Data({
                "Statistic": statisticNumber,
                "Year": yearsSex.id[i],
                "Name": selectedNameId
            }).value
            numBirthsArray.push(numBirths);
        }
        Highcharts.setOptions({
            colors: [color, "#666666"]
        });
        Highcharts.chart("highchart-container", {
            chart: {
                type: 'spline',
                zoomType: "xy",
                borderColor: '#d1d9e1',
                borderWidth: 2,
            },
            title: {
                text: selectedName
            },
            xAxis: {
                categories: yearsArray,
                labels: {
                    rotation: -50
                }
            },
            yAxis: [{ // Primary yAxis
                labels: {
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                reversed: true,
                allowDecimals: false,
                min: 1,
                startOnTick: false,
                tickInterval: 10,
                title: {
                    text: "Rank",
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                }
            }, { // Secondary yAxis
                min: 0,
                allowDecimals: false,
                title: {
                    text: "Number of Births",
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                labels: {
                    format: "{value}",
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                opposite: true
            }
            ],
            tooltip: {
                shared: true
            },
            series: [{
                name: "Number of births",
                type: "column",
                yAxis: 1,
                data: numBirthsArray,
            }, {
                name: "Rank",
                data: rankArray,
            }
            ]
        });

    }
    function initScroll() {
        $('html, body').stop().animate({
            scrollTop: $(".form-gender").offset().top
        }, 2000);
    }

    function scroll() {
        $('html, body').stop().animate({
            scrollTop: $("#latestFigures").offset().top
        }, 2000);
    }

    // Submit function & validation for name input

    function submit() {
        $("#latestFigures").show();
        $("#dl-pdf").hide();
        var nameInput = $("#name-input").val();

        if (jQuery.trim(nameInput) === '') {
            console.log("empty")
            $("#name-input").attr("placeholder", "Please enter a valid name");

        } else {
            $("#name-input").attr("placeholder", "Enter a name");
        };
        var year = $("#selectYearName").val();
        var selectedName = $.trim($("#name-input").val());
        if (selectedName.length == 0) {
            $("#latestFigures").hide()
            return
        }
        selectedName = capitalizeFirstLetter(selectedName);
        $("#name-input").val(selectedName);
        var name = selectedName;

        if (sex == "boy") {
            if (jQuery.inArray(selectedName, availableNamesBoys) == -1) {
                $(".no-records").text(selectedName);
                $("#noRecords").show();
                $("#p1").addClass("hide-text");
                $("#highchart-container").hide();
            } else {
                renderResult(sex, selectedName);
                $("#p1").removeClass("hide-text");
                $("#noRecords").hide();
                $("#highchart-container").show();
                $("#p1, #p2, #p3, #certButton").show();
            }
        } else {
            if (jQuery.inArray(selectedName, availableNamesGirls) == -1) {
                $(".no-records").text(selectedName);
                $("#noRecords").show();
                $("#p1").addClass("hide-text");
                $("#highchart-container").hide();
            } else {
                renderResult(sex, selectedName);
                $("#p1").removeClass("hide-text");
                $("#noRecords").hide();
                $("#highchart-container").show();
                $("#p1, #p2, #p3, #certButton").show();
            }
        }
        $('#name-input').blur();
        renderResultByYear(sex, name, year);
        scroll();
    };

    // Capitalize name

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Year change on name input

    $("#selectYearName").change(function () {
        $("#dl-pdf").hide();
        $("#latestFigures").hide().fadeIn("slow");
        var year = $("#selectYearName").val();

        var selectedName = $.trim($("#name-input").val());
        var name = selectedName;

        if (selectedName.length == 0) {
            $("#latestFigures").hide()
            return
        }

        renderResultByYear(sex, name, year);
        submit();
        scroll();
    });

    $(document).on("click", "#certButton", function (e) {

        $("#loadingPdfContainer").LoadingOverlay("show", {
            image: "",
            fontawesome: "fa fa-spinner fa-pulse fa-3x fa-fw"

        });

        e.preventDefault();
        var year = $("#selectYearName").val();
        var selectedName = $.trim($("#name-input").val());
        selectedName = selectedName.replace(" ", "~");
        var name = selectedName;
        var response;

        $.ajax({
            type: "POST",
            url: "http://pdf.cso.ie/Default.aspx/retreiveNameCert",
            data: '{name: "' + name + '", sex: "' + sex + '", year: "' + year + '", rank: "' + latestRank + '", number: "' + latestNumBirths + '"}',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {

                var pdfPath = "http://pdf.cso.ie/babyNamesCert/" + response.d;
                $("#dl-pdf").attr("href", pdfPath);

                $("#loadingPdfContainer").LoadingOverlay("hide");
                $("#certButton").hide();
                $("#dl-pdf").show();
            },
            failure: function (response) {
                alert('fail');
            }
        });

    });

    $(document).on("click", "#dl-pdf", function () {

    })

    // Year change on table
    $(document).on("change", "#selectYearBoys", function () {


        renderDataTables(sex, $("#selectYearBoys").val(), false);

    });

    $(document).on("change", "#selectYearGirls", function () {

        renderDataTables(sex, $("#selectYearGirls").val(), false);

    });

    // Submit with return key

    $("#name-input").keypress(function (e) {
        if (e.which == 13) {
            submit();
        }
    });

    $(".ui-menu-item").keypress(function (e) {
        if (e.which == 13) {
            submit();
        }
    });

    // Submit with click

    $("#submit").click(function () {
        submit();
    });

    // Find me a name

    $(document).on("click", "#random", function () {

        $("#noRecords").hide();
        $("#dl-pdf").hide();
        var year;
        if (sex === "boy") {
            year = latestYearBoys;
            availableNames = availableNamesBoysRandom;
        } else {
            year = latestYearGirls;
            availableNames = availableNamesGirlsRandom;
        }
        var randomName = availableNames[Math.floor(Math.random() * availableNames.length)];
        renderResultByYear(sex, randomName, year);
        renderResult(sex, randomName);
        $("#selectYearName").val(year);
        $("#name-input").val(randomName);
        $(".highchart-container").fadeIn("slow");
        $("#latestFigures").hide().fadeIn("slow");

    });

    function renderDataTables(sex, year, pageLoad) {

        var dataBoy = [];
        var dataGirl = [];

        if (sex == "boy") {

            if (pageLoad == false) {
                $("#tableContainerBoy").hide();
            }

            if (typeof boyTable == "undefined" && pageLoad == true) { }
            else {
                boyTable.destroy();
            }

            for (i = 0; i < numNamesBoys; i++) {

                var boyItem = [];
                var boyName = boysNames.Category(i).label;

                var boyRank = dsBoys.Data({
                    "Statistic": "VSA05C02",
                    "Year": year,
                    "Name": boysNames.id[i]
                }).value;
                var boyNumBirths = dsBoys.Data({
                    "Statistic": "VSA05C01",
                    "Year": year,
                    "Name": boysNames.id[i]
                }).value;
                if (boyRank == null || boyNumBirths == null) {
                    //skip nulls
                } else {

                    boyItem.push(boyName);
                    boyItem.push(boyRank);
                    boyItem.push(boyNumBirths);
                    dataBoy.push(boyItem);
                }

            }


            $("#tableContainerBoy").LoadingOverlay("hide");

            boyTable = $("#datatable-boy").DataTable({
                sDom: 'Rfrtlip',
                iDisplayLength: 10,
                lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
                language: {
                    processing: '<i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span> ',
                    sSearch: "",
                    searchPlaceholder: "Search names.."
                },
                order: [
                    [1, "asc"]
                ],
                columns: [
                    null, {
                        "type": "num"
                    }, {
                        "type": "num"
                    }
                ],
                autoWidth: false,
                data: dataBoy,
                columns: [{
                    title: "Name"
                }, {
                    title: "Rank"
                }, {
                    title: "Number of Births"
                }
                ]

            });

            if (pageLoad == false) {
                $("#tableContainerBoy").fadeIn();
            }
        }

        if (sex == "girl") {
            if (pageLoad == false) {
                $("#tableContainerGirl").hide();
            }

            if (typeof girlTable == "undefined" && pageLoad == true) { }
            else {
                girlTable.destroy();
            }



            for (i = 0; i < numNamesGirls; i++) {

                var girlItem = [];
                var girlName = girlsNames.Category(i).label;

                var girlRank = dsGirls.Data({
                    "Statistic": "VSA12C02",
                    "Year": year,
                    "Name": girlsNames.id[i]
                }).value;
                var girlNumBirths = dsGirls.Data({
                    "Statistic": "VSA12C01",
                    "Year": year,
                    "Name": girlsNames.id[i]
                }).value;
                if (girlRank == null || girlNumBirths == null) {
                    //skip nulls
                } else {
                    girlItem.push(girlName);
                    girlItem.push(girlRank);
                    girlItem.push(girlNumBirths);
                    dataGirl.push(girlItem);
                }
            }
            $("#tableContainerGirl").LoadingOverlay("hide");
            girlTable = $("#datatable-girl").DataTable({

                sDom: 'Rfrtlip',
                iDisplayLength: 10,
                lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
                language: {
                    sSearch: "",
                    searchPlaceholder: "Search names.."
                },
                order: [
                    [1, "asc"]
                ],
                columns: [
                    null, {
                        "type": "num"
                    }, {
                        "type": "num"
                    }
                ],
                autoWidth: false,
                data: dataGirl,
                columns: [{
                    title: "Name"
                }, {
                    title: "Rank"
                }, {
                    title: "Number of Births"
                }
                ]

            });

            if (pageLoad == false) {

                $("#tableContainerGirl").fadeIn();
            }
        }

    }

});
