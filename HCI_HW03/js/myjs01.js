/**
 * Created by cuvit on 2016-05-10.
 */

function initGlobalVal() {
    curSalery.under2000 = 0;  curSalery.over2000 = 0;
    curSalery.over3000 = 0;  curSalery.over4000 = 0;
    curJobInfo.splice(0, curJobInfo.length);
    curPageHtml.splice(0, curPageHtml.length);
    curItems = 0; curPage = 0;
}

function getProfession(data) {
    var $xml = $(data.responseText);
    xml_array.push($xml);

    $xml.find("content").each(function (i, it) {
        var _profession = $(it).find("profession").text();
        if(_profession != null) {
            job_families_set.add(_profession);
        }
    });

    var newDiv = "<div id='selJobFamBox'> <ul class='list_jobFam'>";
    job_families_set.forEach(function(item) {
        newDiv += '<li><input type="checkbox" class="chk_jobFam" value="' + item + '"> ' + item + "</li>";
    });
    newDiv += "</ul></div>";

    //refresh job family checkbox
    $("#selJobFamBox").remove();
    $("#jobFamContent fieldset").append(newDiv);
}

var downloadJobFam = function() {
    var pgubn_array = [];
    pgubn_array.splice(0, pgubn_array.length);

    var checked = false;  //check whether at least one checkbox is checked or not
    $("#accordion_abil :checked").each(function(i, item) {
        var val = $(this).parent().children(".abil").val();
        pgubn_array.push(val);
        checked = true;
    });
    if(!checked) { //if checkbox is not checked, alert to user
        $("#chkAbilWarning").show();
        return false;
    }
    else {
        $("#chkAbilWarning").hide();
        pageTransition.nextPage();
    }

    //reset job_familes set and remove all accordion_jobFam
    job_families_set.clear();

    //가져온 특성들로 직군들을 가져온다.
    pgubn_array.forEach(function(item) {
        var queryParams = (authentication_key);
        queryParams += '&' + ('svcType') + '=' + ('api');
        queryParams += '&' + ('svcCode') + '=' + ('JOB');
        queryParams += '&' + ('contentType') + '=' + ('xml');
        queryParams += '&' + ('gubun') + '=' + ('job_apti_list');
        if(item != "") {
            queryParams += '&' + ('pgubn') + '=' + item;
        }
        queryParams += '&' + ('perPage=') + '454';

        $.ajax({
            type    :   "GET",
            url     :   end_point_url + queryParams,
            dataType    :   "XML",
            async   : false,
            success :   getProfession,
            error:function(request,status,error){
                _error = error;
                alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
            }
        });
    });

    //새로고침 방지
    return false;
}

function appendJobLabel() {
    for(i = 0; i < beforePageNum; i++) { //delete number of pages
        $("#page" + i).remove();
    }

    var numOfPages = Math.ceil(curJobInfo.length / jobPerPage);
    beforePageNum = numOfPages;

    for(i = 0; i < numOfPages; i++) {
        var btn = '<button ' + 'class=' + 'ui-button' + "' id=page" + i + ' value=' + i + ' style="width":"120px">' + (i + 1) + ' Page</button>';
        $("#pageBtns").append(btn);
        $("#page" + i).button()
            .click(changePage);
    }

    $(".ul_jobs").remove().end();
    $("#jobs").append(curPageHtml[curPage]);
    $(".jobList").click(showDetails);
}

var getJob = function(data) { //get checked job families
    pageTransition.nextPage();
    var job_array = [];
    job_array.splice(0, job_array.length);
    $("#selJobFamBox :checked").each(function(i, item) {
        var val = $(this).parent().children(".chk_jobFam").val();
        job_array.push(val);
    });

    var $xml = $(data.responseText);

    //initialize curSalery, curJobInfo and curItems value
    initGlobalVal();

    //make curJobInfo
    $xml.find("content").each(function (i, it) {
        var _profession = $(it).find("profession").text();
        //선택한 직군에 속하는 직업인지 검사
        job_array.some(function(item) { //break문을 위해 some으로 작성
           if(_profession == item) {
               var _job = $(it).find("job").text();
               var _equal = $(it).find("equalemployment").text();
               var _salery = $(it).find("salery").text();
               if(_salery == '2000 만원 미만') curSalery.under2000 += 1;
               else if(_salery == '2000 만원 이상') curSalery.over2000 += 1;
               else if(_salery == '3000 만원 이상') curSalery.over3000 += 1;
               else if(_salery == '4000 만원 이상') curSalery.over4000 += 1;
               var _prospect = $(it).find("prospect").text();
               var _summary =  $(it).find("summary").text();
               var _similarJob = $(it).find("similarJob").text();

               curJobInfo[ curItems ] = new jobInfo(_job, _equal, _profession,
                   _salery, _prospect, _summary, _similarJob);
               curItems += 1;
               return true;
           }
            return false;
        });
    });
    var howtoSort = $("#sort").val();
    sortJobNMakeLabel(howtoSort);

    appendJobLabel();
}

var downloadJob = function() {
    var checked = false;
    $("#selJobFamBox :checked").each(function(i, item) {
        checked = true;
    });
    if(!checked) {
        $("#chkJobFamWarning").show();
        return false;
    }
    else {
        $("#chkJobFamWarning").hide();
    }

    var queryParams = (authentication_key);
    queryParams += '&' + ('svcType') + '=' + ('api');
    queryParams += '&' + ('svcCode') + '=' + ('JOB');
    queryParams += '&' + ('contentType') + '=' + ('xml');
    queryParams += '&' + ('gubun') + '=' + ('job_apti_list');
    queryParams += '&' + ('perPage=') + '454';

    $.ajax({
        type    :   "GET",
        url     :   end_point_url + queryParams,
        dataType    :   "XML",
        async   : false,
        success :   getJob,
        error:function(request,status,error){
            _error = error;
            alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
        }
    });

    //새로고침 방지
    return false;
}

function getColorBySortNRating(howtoSort, job) {
    if(howtoSort == "직업 이름") {
        return "#848484";
    }
    else if(howtoSort == "연봉") {
        if(salery2num[job.salery] == 0) return "#848484";
        else if(salery2num[job.salery] == 1) return "#000069";
        else if(salery2num[job.salery] == 2) return "#0000CD";
        else if(salery2num[job.salery] == 3) return "#0A82FF";
        else if(salery2num[job.salery] == 4) return "#01DFD7";
    }
    else if(howtoSort == "전망") {
        if (prospEqual2num[job.prospect] == 0) return "#848484";
        else if(prospEqual2num[job.prospect] == 1) return "#000069";
        else if(prospEqual2num[job.prospect] == 2) return "#0000CD";
        else if(prospEqual2num[job.prospect] == 3) return "#0A82FF";
        else if(prospEqual2num[job.prospect] == 4) return "#01DFD7";
    }
    else if( howtoSort == "고용평등률") {
        if (prospEqual2num[job.equal] == 0) return "#848484";
        else if(prospEqual2num[job.equal] == 1) return "#000069";
        else if(prospEqual2num[job.equal] == 2) return "#0000CD";
        else if(prospEqual2num[job.equal] == 3) return "#0A82FF";
        else if(prospEqual2num[job.equal] == 4) return "#01DFD7";
    }
}

function sortJobNMakeLabel(howtoSort) {
    if(howtoSort == "직업 이름") {
        curJobInfo.sort(function(a, b) {
            return a.job < b.job ? -1 : a.job > b.job ? 1 : 0;
        });
    }
    else if(howtoSort == "연봉") {
        curJobInfo.sort(function(a, b) {
            _a = salery2num[a.salery]; _b = salery2num[b.salery];
            return _a > _b ? -1 : _a < _b ? 1 : 0;
        });
    }
    else if(howtoSort == "전망") {
        curJobInfo.sort(function(a, b) {
            _a = prospEqual2num[a.prospect]; _b = prospEqual2num[b.prospect];
            return _a < _b ? 1 : _a > _b ? -1 : 0;
        });
    }
    else if(howtoSort == "고용평등률") {
        curJobInfo.sort(function(a, b) {
            _a = prospEqual2num[a.equal]; _b = prospEqual2num[b.equal];
            return _a < _b ? 1 : _a > _b ? -1 : 0;
        });
    }

    //devide job by page
    var numOfJob = 0; var page = 0;
    var jobDiv = "<div class='ul_jobs'><ul>";
    curJobInfo.forEach(function(item) {
        var color = getColorBySortNRating(howtoSort, item);
        jobDiv += "<li class='jobList' value='" + item.job + "' style='background: " + color + "'>" + item.job + "</li>";
        numOfJob += 1;
        if( (numOfJob + jobPerPage)%jobPerPage == 0 ) {
            jobDiv += "</ul></div>";
            curPageHtml[page] = jobDiv;
            jobDiv = "<div class='ul_jobs'><ul>";
            page += 1;
        }
    });
    curPageHtml[page] = jobDiv; //insert rest jobs
    jobDiv += "</ul></div>"
}

function showDetails() {
    $("#dialog").remove();
    var selectedJob = $(this).attr("value");
    var dialogDiv = "<div id='dialog' title=" + selectedJob + ">";
    curJobInfo.forEach(function(item) {
        if( item.job == selectedJob ) {
            //d3 graph


            dialogDiv += '<p class="p_remark"><big>직업 설명</big></p>' + item.summary;
            dialogDiv += '<p class="p_remark"><big>전망 : ' + item.prospect +'</big></p>';
            dialogDiv += '<p class="p_remark"><big>연봉 : ' + item.salery +'</big></p>';
            dialogDiv += '<p class="p_remark"><big>고용평등률 : ' + item.equal +'</big></p>';
            dialogDiv += '<p class="p_remark"><big>비슷한 직업 : </big>' + item.similarJob +'</p>';
            return true;
        }
        return false;
    });
    dialogDiv += "</div>"
    $('body').append(dialogDiv);
    $("#dialog").dialog({
        width: 900,
        height: 600,
        autoOpen: false,
        resizable: false,
        draggable: false,
        position:{my:"center", at:"center", of:$(this).parent()}
    });
    $("#dialog").dialog("open");
}

var changeSort = function() {
    var howtoSort = $("#sort").val();
    sortJobNMakeLabel(howtoSort);
    appendJobLabel();
}

function changePage() {
    curPage = $(this).val();
    appendJobLabel();
}

function changeAbilChk() {
    var val = $(this).val();
    if(this.checked) {
        $(this).parents().children("#abil_" + val).css("background", "#F4FA58");
    }
    else {
        $(this).parents().children("#abil_" + val).css("background", "#f6f6f6");
    }
}

function reset() {
    //initialize curSalery, curJobInfo and curItems value
    initGlobalVal();

    //refresh ability accordion
    $(".abilTab").css("background", "#f6f6f6");
    $("#accordion_abil :checked").each(function(i, item) {
        this.checked = false;
    });

    $("#selJobFamBox").remove(); //refresh job family checkbox
    $(".ul_jobs").remove().end(); //refresh job

    pageTransition.nextPage();
}