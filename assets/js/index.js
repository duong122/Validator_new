

function Validator(formSelector) {

    var formRules = {}

    // Lấy ra element trong dom theo `formSelector` 
    var formElement = document.querySelector(formSelector)

    if(formElement) {
        
        var inputs = formElement.querySelectorAll('[name][rules]')
            
        for(var input of inputs) {
            console.log(input)
        }

        
    }
}