

// Thư viện dùng cho validator
function Validator(selector, options) {

    function getParentElement(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)){
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    /**
     * Tạo ra các rule kiểm tra giá trị được truyền vào 
     * 1. Nếu đúng thì return undefined
     * 2. Nếu sai thì return message lỗi
     */
    var validatorRules = {
        required: (value) => {
            return value ? undefined : 'Please enter this field'
        },
        email: (value) => {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : 'The input is not a email'
        },
        min: (minValue) => {
            return (value) => {
                return value.length >= minValue ? undefined : `Please enter at least ${minValue} characters`
            }
        },
        max: (maxValue) => {
            return (value) => {
                return value.length <= maxValue ? undefined : `Please enter less than ${max} characters`
            }
        }
    }

    // Rules của từng input tương ứng sẽ được lưu vào biến inputRules
    var inputRules = {}

    // Lấy ra form cần kiểm tra 
    var formElements = document.querySelector(selector)
    if(formElements){

        // Lấy ra các input mà có rules và name
        var inputs =document.querySelectorAll('[name][rules]')

        // Các gán các rule function của các input tương ứng vào thành một cặp key-value trong inputRules
        Array.from(inputs).forEach((input) => {
            var rules = input.getAttribute('rules')
            var ruleItems = rules.split('|')           
            
            // 
            ruleItems.map((rule) => {
                let isHasValue = rule.includes(':')
                if(isHasValue) {
                    var ruleInfo = rule.split(':')
                    rule = ruleInfo[0]
                }

                var ruleFunc = validatorRules[rule]
                if(isHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1])
                }
                // console.log(ruleFunc)

                if(Array.isArray(inputRules[input.name])) {
                    inputRules[input.name].push(ruleFunc)
                } else {
                    inputRules[input.name] = [ruleFunc]
                }
            })

            input.onblur = handleValidate
            input.oninput = handleClearError

        })

        // console.log(inputRules)     
    }


    // Hàm validate khi blur khỏi một input
    function handleValidate(event) {
        let rules = inputRules[event.target.name]
        let errorMessage

        rules.find((rule) => {
            errorMessage = rule(event.target.value)
            return errorMessage
        })

        if(errorMessage) {
            let formGroup = getParentElement(event.target, '.form-group')
            if (formGroup)  {
                var formMessage = formGroup.querySelector('.form-message')
                if(formMessage) {
                    formMessage.innerText = errorMessage
                    formGroup.classList.add('invalid')
                }
            }
        }

        return !errorMessage
    }

    // Hàm xóa bỏ lỗi khi nhập vào một input
    function handleClearError(event) {
        var formGroup = getParentElement(event.target, '.form-group')
        var errorElement = formGroup.querySelector('.form-message')

        if(formGroup.classList.value.includes('invalid')) {
            console.log('clear invalid')
            formGroup.classList.remove('invalid')
            errorElement.innerText = ''
        } 
    }

    // Xử lý hành vi submit form
    formElements.onsubmit = (event) => {
        event.preventDefault()

        var inputs = document.querySelectorAll('[name][rules]')   
        var isAllValidate = true

        for(var input of inputs) {
            if(!handleValidate({target: input})) {
                isAllValidate = false
            }
        }

        if(isAllValidate) {
            if(typeof options.onSubmit === 'function') {
                var enableInputs = document.querySelectorAll('name')
                var data = Array.from(inputs).reduce((values, input) => {
                    values[input.name] = input.value
                    return values
                }, {})
    
                options.onSubmit(data)
            } else {
               formElements.submit()
            }
        } else {
            console.log('Absent of essential data !!!')
        }
    }
}