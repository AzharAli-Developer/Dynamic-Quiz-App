var questions = [];
var currentIndex = 0;
var right = 0;
var wrong = 0;

const add = (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    var question = document.getElementById("question").value;
    let one = document.getElementById("one").value;
    let two = document.getElementById("two").value;
    let three = document.getElementById("three").value;
    let four = document.getElementById("four").value;
    let ans = document.getElementById("ans").value;

    // Add the current question to the array
    questions[currentIndex] = {
        question: question,
        a: one,
        b: two,
        c: three,
        d: four,
        answer: ans
    };

    // Increment the index for the next question
    currentIndex++;

    // console.log(questions);

    // Clear input fields after adding question
    document.getElementById("question").value = "";
    document.getElementById("one").value = "";
    document.getElementById("two").value = "";
    document.getElementById("three").value = "";
    document.getElementById("four").value = "";
    document.getElementById("ans").value = "";
}

var index = 0;
const loadQuiz = () => {
    var list = questions[index]
    deselect();
    document.getElementById("question1").innerHTML = list.question;
    document.getElementById("firstly").innerHTML = list.a;
    document.getElementById("secondly").innerHTML = list.b;
    document.getElementById("thirdly").innerHTML = list.c;
    document.getElementById("fourly").innerHTML = list.d;
    document.getElementById("second").style.display = "block";

}

// deselect the option if options is already is selected in the input options

const deselect = () => {
    let options = document.querySelectorAll(".input")
    options.forEach(input => input.checked = false)
}

// update the question ehen the user is click on submit button

const update = () => {
    if ((index + 1) < questions.length) {
        index++;
        loadQuiz();
    }
    else {
        end();
    }
}


// if questions are end than the final result show in this functions 

const end = () => {
    document.getElementById("end").innerHTML =`<h1>Your obtain  marks is :${right}/${questions.length}</h1>`
}


// add event listener on the function submit


const submit = document.getElementById("submitbutton");
submit.addEventListener('click', () => {
    var result = resultt();
    // console.log(result)
    var list = questions[index]
    if (result == list.answer) {
        right++
        // console.log("correct is :" + right)
    }
    else {
        wrong++;
        // console.log("wrong is :" + wrong)
    }

    update();

})


// take the value of option which value is to be selected in the options

const resultt = () => {
    var final
    let inputt = document.querySelectorAll(".input")
    inputt.forEach(input => {
        if (input.checked) {
            final = input.value
        }
    })
    return final
}
