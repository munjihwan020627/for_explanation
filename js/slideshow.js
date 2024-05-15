var slides = document.querySelectorAll("#slides > img");
var prev = document.getElementById("prev");
var next = document.getElementById("next");
var slides2 = document.querySelector("#slides");
var current = 0;

showSlides(current);
prev.onclick = prevSlide;
next.onclick = nextSlide;

var buttons = document.querySelectorAll(".buttons");
for (let i = 0; i < buttons.length; i++) {
  buttons[i].onclick = animateSlide;
}

function showSlides(n) {
  slides2.style.left = -current*1200 + "px";
}

function prevSlide() {
  if (current > 0) current -= 1;
  else
    current = slides.length - 1;
    showSlides(current);
}

function nextSlide() {
  if (current < slides.length - 1) current += 1;
  else
    current = 0;
    showSlides(current);  
}

function animateSlide() {
  var loc = parseInt(this.getAttribute("loc"))-1;
  if(loc>=0 && loc<buttons.length) current=loc;
  showSlides(current);  
}







function newRegister() {
  console.log("newRegister 함수가 실행되었습니다.");
  var newItem = document.createElement("li");  // 요소 노드 추가
  var subject = document.querySelector("#subject");  // 폼의 텍스트 필드
  const newText = document.createElement('span');
  newText.textContent = subject.value;
  subject.value='';
  const newCheckbox = document.createElement('input');
  newCheckbox.type='checkbox';
  var newImage = document.createElement("img");
  newImage.src = "images/trash.png";
  newImage.style.width = "14px";
  newItem.appendChild(newCheckbox);
  newItem.appendChild(newText);   // 텍스트 노드를 요소 노드의 자식 노드로 추가
  newItem.appendChild(newImage);
  var itemList = document.querySelector("#itemList");  // 웹 문서에서 부모 노드 가져오기 
  itemList.prepend(newItem);  // 새로 만든 요소 노드를 부모 노드에 추가

  newCheckbox.addEventListener('change', (event) =>{ 
    newText.style.textDecoration = (event.currentTarget.checked) ? 'line-through' : 'none';
  })  

  newImage.addEventListener("click", function() { // 항목 클릭했을 때 실행할 함수
    if(this.parentNode && this.parentNode.parentNode) {  // 부모 노드가 있다면 
      var is = this.parentNode;
      is.parentNode.removeChild(is);  // 부모 노드에서 삭제
    }
  });
}










import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.9.0';

// Since we will download the model from the Hugging Face Hub, we can skip the local model check
env.allowLocalModels = false;

// Reference the elements that we will need
const status = document.getElementById('status');
const fileUpload = document.getElementById('file-upload');
const imageContainer = document.getElementById('image-container');

status.textContent = 'Downloading detection model...';
const detector = await pipeline('object-detection', 'Xenova/detr-resnet-50');

status.textContent = 'Downloading image-to-text conversion model...';
const captioner = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning');
status.textContent = 'Ready';

fileUpload.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) {
        return;
    }
    const reader = new FileReader();
    // Set up a callback when the file is loaded
    reader.onload = function (e2) {
        imageContainer.innerHTML = '';
        const image = document.createElement('img');
        image.src = e2.target.result;
        imageContainer.appendChild(image);
        detect(image);
    };
    reader.readAsDataURL(file);
});

// Detect objects in the image
async function detect(img) {
    status.textContent = 'Detectng object(s)...';
    const output = await detector(img.src, {
        threshold: 0.5,
        percentage: true,
    }); 
    console.log(output);
    output.forEach(renderBox);

    status.textContent = 'Figuring out the meaning of image...';
    const output2 = await captioner(img.src);
    console.log(output2);
    status.textContent = output2[0].generated_text;
    
}

// Render a bounding box and label on the image
function renderBox({ box, label }) {
    const { xmax, xmin, ymax, ymin } = box;

    // Generate a random color for the box
    const color = '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, 0);

    // Draw the box
    const boxElement = document.createElement('div');
    boxElement.className = 'bounding-box';
    Object.assign(boxElement.style, {
        borderColor: color,
        left: 100 * xmin + '%',
        top: 100 * ymin + '%',
        width: 100 * (xmax - xmin) + '%',
        height: 100 * (ymax - ymin) + '%',
    })

    // Draw label
    const labelElement = document.createElement('span');
    labelElement.textContent = label;
    labelElement.className = 'bounding-box-label';
    labelElement.style.backgroundColor = color;

    boxElement.appendChild(labelElement);
    imageContainer.appendChild(boxElement);
}














