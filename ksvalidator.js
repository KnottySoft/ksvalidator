var ksvalidationlibrary = function () {
    this.lang = "EN";  
    this.errmsg_required = "";
    this.errmsg_length_min = "";
    this.errmsg_length_max = "";
    this.errmsg_length_min_max = "";
    this.errmsg_email = "";
    this.errmsg_postal = "";
    this.errmsg_regex = "";
    this.errmsg_alphanum = "";
    this.errmsg_alpha = "";
    this.errmsg_numeric = "";
    this.errmsg_phone = "";
    this.errmsg_checkbox_min = "";
    this.errmsg_checkbox_max = "";
    this.errmsg_checkbox_minmax = "";
};

ksvalidationlibrary.prototype = function () {
    var submitted = false;

    // Sets the language of the validator when initialised    
    var setLang = function () {
        switch(ksvalidator.lang.toUpperCase()) {
            case "FR":
                errmsg_required = "Le champ est requis!";
                errmsg_length_min = "Le champ doit contenir minimum {0} charactère!";
                errmsg_length_max = "Field must be a maximum of {0}!";
                errmsg_length_min_max = "Field must be a minimum of {0} and a maximum of {1}!";
                errmsg_email = "The email is invalid!";
                errmsg_postal = "The postal code is invalid!";
                errmsg_regex = "Custom regex message!";
                errmsg_alphanum = "Must only contain letters and numbers!";
                errmsg_alpha = "Must only contain letters!";
                errmsg_numeric = "Must only contain numbers!";
                errmsg_phone = "Phone number is invalid!";
                errmsg_checkbox_min = "Must select minimum of {0} elements!";
                errmsg_checkbox_max = "Must select maximum of {0} elements!";
                errmsg_checkbox_minmax = "Must select a minimum of {0} and a maximum of {1} elements!";
                break;
            default:
                errmsg_required = "Field is required!";
               errmsg_length_min = "Field must be a minimum of {0}!";
                errmsg_length_max = "Field must be a maximum of {0}!";
                errmsg_length_min_max = "Field must be a minimum of {0} and a maximum of {1}!";
                errmsg_email = "The email is invalid!";
                errmsg_postal = "The postal code is invalid!";
                errmsg_regex = "Custom regex message!";
                errmsg_alphanum = "Must only contain letters and numbers!";
                errmsg_alpha = "Must only contain letters!";
                errmsg_numeric = "Must only contain numbers!";
                errmsg_phone = "Phone number is invalid!";
                errmsg_checkbox_min = "Must select minimum of {0} elements!";
                errmsg_checkbox_max = "Must select maximum of {0} elements!";
                errmsg_checkbox_minmax = "Must select a minimum of {0} and a maximum of {1} elements!";
        };
    };

    // Verifies if the control has value
    var controlRequired = function () {
        if (this.getAttribute('k-reject')) {
            return;
        }
        var val;
        var child = document.getElementById(this.id + '_error')

        switch (this.getAttribute('k-required').toLowerCase()) {
            case "select":
            case "textarea":
            case "text":
            case "month":
            case "date":
                val = this.value;
                break;
            case "check":
            case "checkbox":
                val = getCheckboxValue(this);
                break;
            default:
                val = null;
                console.error(this.id + ": k-required parameter invalid!");
        };
        if (!val) {
            removeChild(child);
            var pid = this.id + '_error';
            var pclass = "k_error error_required";
            var pmsg = errmsg_required;
            var fragment = createChild(pid, pclass, pmsg, this);

        } else {
            removeChild(child, "error_required");
        }
        // If the function is currently looped by the submit button, do not validate
        if (submitted === false) {
            validateForm();
        };
    };


    var controlLength = function () {
        if (this.getAttribute('k-reject')) {
            return;
        }
        var attr_arr = this.getAttribute('k-length').toLowerCase().split(',');
        var child = document.getElementById(this.id + '_error')
        var invalid = true,
            pid, pclass, pmsg;
        switch (attr_arr[0]) {
            case "min":
                invalid = (this.value.length < attr_arr[1]);
                pmsg = errmsg_length_min.replace("{0}", attr_arr[1]);
                break;
            case "max":
                invalid = (this.value.length > attr_arr[1]);
                pmsg = errmsg_length_max.replace("{0}", attr_arr[1]);
                break;
            case "minmax":
                invalid = (!((this.value.length >= attr_arr[1]) && (this.value.length <= attr_arr[2])));
                pmsg = errmsg_length_min_max.replace("{0}", attr_arr[1]).replace("{1}", attr_arr[2]);
                break;
            default:
                invalid = true;
                console.error(this.id + ': k-length parameter invalid!');
        }
        if (invalid) {
            removeChild(child);
            pid = this.id + '_error';
            pclass = "k_error error_length";
            var fragment = createChild(pid, pclass, pmsg, this);
        } else {
            removeChild(child, "error_length");
        }
        updatePanel(this);
    };


    //  verify the control against the user provided regex
    var controlRegex = function () {
        if (this.getAttribute('k-reject')) {
            return;
        }
        var regex = new RegExp(this.getAttribute('k-regex'));
        var val = this.value;

        var child = document.getElementById(this.id + '_error')
        if (!regex.test(val)) {
            removeChild(child);
            var pid = this.id + '_error';
            var pclass = "k_error error_regex";
            var pmsg = errmsg_regex;
            var fragment = createChild(pid, pclass, pmsg, this);
        } else {
            removeChild(child, "error_regex");
        };
        updatePanel(this);
    };

    //  verify the control against the default alphanumeric regex
    // alpha, num, alphanum, phone, postal
    var controlDataType = function () {
        if (this.getAttribute('k-reject')) {
            return;
        }
        var attr_arr = this.getAttribute('k-data-type').toLowerCase().split(',');
        var child = document.getElementById(this.id + '_error')
        var invalid, regex, pid, pclass, pmsg;
        switch (attr_arr[0]) {
            case 'alpha':
            case 'alphabetical':
                regex = /^[a-zA-Z]*$/;
                invalid = !regex.test(this.value);
                pmsg = errmsg_alpha;
                break;
            case 'num':
            case 'numeric':
                regex = /^[0-9]*$/;
                invalid = !regex.test(this.value);
                pmsg = errmsg_numeric;
                break;
            case 'alphanum':
            case 'alphanumeric':
                regex = /^[a-zA-Z0-9]*$/;
                invalid = !regex.test(this.value);
                pmsg = errmsg_alphanum;
                break;
            case 'postal':
            case 'postalcode':
                invalid = testDataPostal(attr_arr[1]);
                pmsg = errmsg_postal;
                break;
            case 'email':
                regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                invalid = !regex.test(this.value);
                pmsg = errmsg_email;
                break;
            case 'phone':
                invalid = testDataPhone(attr_arr[1]);
                pmsg = errmsg_phone;
                break;
            default:
                invalid = true;
                console.error(this.id + ': k-data-type parameter invalid!');
        }

        if (invalid) {
            removeChild(child);
            var pid = this.id + '_error';
            var pclass = "k_error error_data_type";
            var fragment = createChild(pid, pclass, pmsg, this);
        } else {
            removeChild(child, "error_data_type");
        };
        updatePanel(this);
    };

    // 	Verify the control against the user provided minimum
    var controlCheckbox = function () {
        if (this.getAttribute('k-reject')) {
            return;
        }
        var parent = this.childNodes;
        var child = document.getElementById(this.id + '_error')
        var attr_arr = this.getAttribute('k-checkbox').toLowerCase().split(',');
        var val = 0;
        var invalid, regex, pid, pclass, pmsg;
        for (var i = parent.length; i--;) {
            if (parent[i].type == "checkbox") {
                if (parent[i].checked) {
                    val++;
                }
            }
        };
        switch (attr_arr[0]) {
            case 'min':
                invalid = (val < attr_arr[1]);
                pmsg = errmsg_checkbox_min.replace('{0}', attr_arr[1]);
                break;
            case 'max':
                invalid = (val > attr_arr[1]);
                pmsg = errmsg_checkbox_max.replace('{0}', attr_arr[1]);
                break;
            case 'minmax':
                invalid = (!((val >= attr_arr[1]) && (val <= attr_arr[2])));
                pmsg = errmsg_checkbox_minmax.replace('{0}', attr_arr[1]).replace('{1}', attr_arr[2]);
                break;
        }


        if (invalid) {
            removeChild(child);
            var pid = this.id + '_error';
            var pclass = "k_error error_checkbox";
            var fragment = createChild(pid, pclass, pmsg, this);
        } else {
            removeChild(child, "error_checkbox");
        };
        updatePanel(this);
    };

    // 	Do not allow any form of validation on this control
    var controlReject = function (pchild) {
        if (!pchild.getAttribute('k-reject')) {
            var att = document.createAttribute("k-reject");
            att.value = "reject";
            pchild.setAttributeNode(att);
        }
    };
    
    var controlCall = function (obj) {
        for (var y = obj.attributes.length; y--;) {
            if (obj.attributes.length > 0) {
                try {
                    validateListeners(obj.attributes[y].name, obj);
                } catch (err) {
                    //console.log(err);
                } finally {
                    continue;
                }
            }
        };
    };
    
    // 	Allow validation on this control
    var controlAllow = function (pchild) {
        if (pchild.getAttribute('k-reject')) {
            pchild.removeAttribute('k-reject');
        };
    };

    // 	Scan the form for errors, prevent submit if error count > 0, display error panel
    var validateForm = function () {
        var controls = [];
        var items = document.getElementsByTagName("*");

        var submit = this.type === "SUBMIT" || this.tagName === "BUTTON";
        if (submit) {
            if (this.getAttribute('k-reject')) {
                return;
            }
            submitted = true;
            for (var i = items.length; i--;) {
                for (var y = items[i].attributes.length; y--;) {

                    if (items[i].attributes.length > 0) {
                        try {
                            validateListeners(items[i].attributes[y].name, items[i]);
                        } catch (err) {
                            //console.log(err);
                        } finally {
                            continue;
                        }
                    }
                }
            };
            submitted = false;
        }
        for (var i = 0; i < items.length; i++) {
            //if (items[i].classList.contains('k_error')) {
            if (containsClass(items[i], 'k_error')) {
                controls.push(items[i]);
            }
        }
        var init = createPanel(items);
        if (controls.length > 0) {
            if (init) {
                var fragment = createChildHtml("<div id='error_panel' class='panel panel-danger'><ul id='error_list'></ul></div>");
                init.parentNode.insertBefore(fragment, init);
                for (var i = 0; i < controls.length; i++) {
                    init = document.getElementById('error_list');
                    fragment = createChildHtml("<li> <span>" + (i + 1) + ": </span><a href='#" + controls[i].id + "'>" + controls[i].innerHTML + "</a></li>");
                    init.appendChild(fragment);
                }
            }
            return false;
        } else {
            return true;
        }
    };

    //	Validate the form for errors
    var validateListeners = function (name, attr) {
        if (attr.getAttribute('k-reject')) {
            return;
        }
        switch (name) {
            case "k-required":
                controlRequired.controlCall(attr);
                break;
            case "k-regex":
                controlRegex.controlCall(attr);
            case "k-length":
                controlLength.controlCall(attr);
            case "k-data-type":
                controlDataType.controlCall(attr);
                break;
            case "k-checkbox":
                var val = getCheckboxValue(attr);
                if (val) {
                    controlCheckbox.controlCall(attr);
                }
                break;
            default: //do nothing
        };
    };

    // 	Loads the listeners
    var load = function () {
        var init;
        var items = document.getElementsByTagName("*");
        for (var i = items.length; i--;) {
            if (items[i].getAttribute("k-init")) {
                init = true;
                break;
            };
        };
        // If form has been initialised to use the k-validator
        if (init) {
            for (var i = items.length; i--;) {
                for (var y = items[i].attributes.length; y--;) {
                    loadListeners(items[i].attributes[y].name, items[i]);
                }
            };
        };
        setLang();
    };

    //  Add listeners to each control bearing a validation tag
    var loadListeners = function (name, attr) {
        if (attr.getAttribute('k-reject')) {
            return;
        }

        switch (name) {
            case "k-required":
                switch (attr.getAttribute('k-required').toLowerCase()) {
                    case "textarea":
                    case "text":
                        attr.addEventListener("blur", controlRequired, false);
                        break;
                    case "checkbox":
                        attr.addEventListener("click", controlRequired, false);
                        break;
                    case "date":
                        attr.addEventListener("blur", controlRequired, false);
                        break;
                };
                break;
            case "k-regex":
                attr.addEventListener("change", controlRegex, false);
                break;
            case "k-length":
                attr.addEventListener("change", controlLength, false);
                break;
            case "k-data-type":
                attr.addEventListener("change", controlDataType, false);
                break;
            case "k-checkbox":
                attr.addEventListener("click", controlCheckbox, false);
                break;
            case "k-validate":
                attr.addEventListener("click", validateForm, false);
                break;
            default: //do nothing
        };
    };

    //  Create the error panel 
    var createPanel = function (items) {
        for (var i = items.length; i--;) {
            if (items[i].getAttribute("k-init")) {
                init = items[i];
                break;
            }
        }
        // Remove existing panel if one exists
        var panel = document.getElementById("error_panel");
        if (panel) {
            removeChild(panel);
        }
        return init;
    };

    var updatePanel = function (obj) {
        if (!obj.getAttribute('k-required')) {
            validateForm();
        };
    };

    //  Create the error tag to insert
    var createChild = function (pid, pclass, pmessage, obj) {
        var htmlStr = "<span id='" + pid + "' class='" + pclass + "'>" + pmessage + "</span>";
        var frag = document.createDocumentFragment(),
            temp = document.createElement('div');
        temp.innerHTML = htmlStr;
        while (temp.firstChild) {
            frag.appendChild(temp.firstChild);
        }
        obj.parentNode.insertBefore(frag, obj);
    };

    //  Create the error tag to insert
    var createChildHtml = function (htmlStr) {
        var frag = document.createDocumentFragment(),
            temp = document.createElement('div');
        temp.innerHTML = htmlStr;
        while (temp.firstChild) {
            frag.appendChild(temp.firstChild);
        }
        return frag;
    };

    // 	Removes a child element (used for errors)
    var removeChild = function (pChild, pClass) {
        if (pClass) {
            if (pChild) {
                //if (pChild.classList.contains(pClass)) {
                if (containsClass(pChild, pClass)) {
                    //pchild.remove();
                    pChild.parentNode.removeChild(pChild);
                }
            }
        } else {
            if (pChild) {
                //pChild.remove();
                pChild.parentNode.removeChild(pChild);
            }
        }
    };
    
    var getCheckboxValue = function (attr) {
        var val = 0;

        for (var i = attr.childNodes.length; i--;) {
            try {
                if (attr.childNodes[i].type === "checkbox") {
                    if (attr.childNodes[i].checked) {

                        val++;

                    }
                }
            } catch (err) {
                continue;
            };
        };
        return val;
    };

    var testDataPhone = function (attr) {
        switch (attr.toLowerCase()) {
            case 'ca':
                break;
            case 'us':
                break;
        }
    };

    var testDataPostal = function (attr) {
        switch (attr.toLowerCase()) {
            case 'ca':
                break;
            case 'us':
                break;
        }
    };

    var containsClass = function (pObj, pClass) {
        if (!pObj || typeof pClass !== 'string') {
            return false;
        } else if (pObj.className && pObj.className.trim().split(/\s+/gi).indexOf(pClass) > -1) {
            return true;
        } else {
            return false;
        }
    };

    return {
        load: load,
        call: controlCall,
        allow: controlAllow,
        reject: controlReject
    }
} ();

var ksvalidator = new ksvalidationlibrary();