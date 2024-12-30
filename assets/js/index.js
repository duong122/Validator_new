

function Validator(formSelector, options = {}) {

    function getParentElement(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    var formRules = {}

    var validatorRules = {
        required: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : 'Vui lòng nhập email'
        },
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} ký tự`
            }
        },
        max: function (max) {
            return function (value) {
                return value.length <= max ? undefined : `Vui lòng nhập tối đa ${max} ký tự`
            }
        },
    }

    // Lấy ra element trong dom theo `formSelector` 
    var formElement = document.querySelector(formSelector)

    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]')
        for (var input of inputs) {
            var rules = input.getAttribute('rules').split('|')

            for (var rule of rules) {
                var ruleInro;
                var isRuleHasValue = rule.includes(':')

                if (isRuleHasValue) {
                    var ruleInfo = rule.split(':')
                    rule = ruleInfo[0]
                }

                var ruleFunc = validatorRules[rule]
                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1])
                }

                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc)
                } else {
                    formRules[input.name] = [ruleFunc]
                }
            }

            // Lắng nghe sự kiện để vaidate (blur, change, ...)

            input.onblur = handleValidate
            input.oninput = handleClearError

        }

        // Hàm clear Message lỗi
        function handleValidate(event) {
            var rules = formRules[event.target.name]
            var errorMessage

            rules.find(function (rule) {
                errorMessage = rule(event.target.value)
                return errorMessage
            })

            if (errorMessage) {
                var formGroup = getParentElement(event.target, '.form-group')
                if (formGroup) {
                    var formMessage = formGroup.querySelector('.form-message')
                    if (formMessage) {
                        formGroup.classList.add('invalid')
                        formMessage.innerText = errorMessage
                    }
                }
            }

            return !errorMessage
        }

        // Nếu có lỗi thì hiển thị message lỗi ra UI
        function handleClearError(event) {
            var formGroup = getParentElement(event.target, '.form-group')
            if (formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid')
                formGroup.querySelector('.form-message').innerText = ''
            }
        }
    }


    // Xử lý hành vi submit của form
    formElement.onsubmit = function (event) {
        event.preventDefault()

        var inputs = formElement.querySelectorAll('[name][rules]')
        var isValid = true;

        for (var input of inputs) {
            if (!handleValidate({ target: input })) {
                isValid = false
            }
        }

        // Khi không có lỗi thì submit form
        if (isValid) {
            if (typeof options.onSubmit === 'function') {
                var enableInputs = formElement.querySelectorAll('[name]')
                var formValues = Array.from(enableInputs).reduce((values, input) => {
                    values[input.name] = input.value
                    return values
                }, {})

                // Gọi lại hàm submit và trả về giá trị của form
                options.onSubmit(formValues)
            } else {
                formElement.submit()
            }
        }
    }
}