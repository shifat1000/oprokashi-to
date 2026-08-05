/*=========================================================
    OPROKASHITO V2
    APP.JS
    BLOCK 01
=========================================================*/


const storyContainer =
document.getElementById("storyContainer");


const searchInput =
document.getElementById("searchInput");


const categoryFilter =
document.getElementById("categoryFilter");


let stories = [];



async function loadStories(){

    storyContainer.innerHTML=`
    <div class="empty">
    গল্প লোড হচ্ছে...
    </div>
    `;


    const {data,error}=await supabaseClient

    .from("stories")

    .select("*")

    .order("id",{ascending:false});


    if(error){

        storyContainer.innerHTML=`
        <div class="empty">
        গল্প লোড করা যায়নি।
        </div>
        `;

        console.log(error);

        return;

    }


    stories=data;

    renderStories(stories);

}

/*=========================================================
    OPROKASHITO V2
    APP.JS
    BLOCK 02
=========================================================*/


function renderStories(list){

    if(list.length===0){

        storyContainer.innerHTML=`
        <div class="empty">
            কোনো গল্প পাওয়া যায়নি।
        </div>
        `;

        return;

    }



    storyContainer.innerHTML="";



    list.forEach(story=>{


        const card=document.createElement("div");

        card.className="story-card";



        const image=story.image
        ? story.image
        : "images/default-cover.jpg";



        const shortStory=

        story.story.length>150

        ? story.story.substring(0,150)+"..."

        : story.story;



        card.innerHTML=`

        <img
        class="story-image"
        src="${image}"
        alt="${story.title}">

        <div class="story-content">

        <span class="story-category">

        ${story.category}

        </span>

        <h3 class="story-title">

        ${story.title}

        </h3>

        <p class="story-author">

        ✍ ${story.author}

        </p>

        <p class="story-excerpt">

        ${shortStory}

        </p>

        <a
        class="story-btn"
        href="story.html?id=${story.id}">

        গল্প পড়ুন

        </a>

        </div>

        `;



        storyContainer.appendChild(card);


    });



}

/*=========================================================
    OPROKASHITO V2
    APP.JS
    BLOCK 03
=========================================================*/


function filterStories(){

    const keyword = searchInput.value.toLowerCase().trim();

    const category = categoryFilter.value;

    const filtered = stories.filter(story => {

        const matchText =
            story.title.toLowerCase().includes(keyword) ||
            story.story.toLowerCase().includes(keyword) ||
            story.author.toLowerCase().includes(keyword);

        const matchCategory =
            category === "all" ||
            story.category === category;

        return matchText && matchCategory;

    });

    renderStories(filtered);

}



searchInput.addEventListener(

    "input",

    filterStories

);



categoryFilter.addEventListener(

    "change",

    filterStories

);



loadStories();