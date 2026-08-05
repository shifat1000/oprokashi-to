const form = document.getElementById("storyForm");
const message = document.getElementById("message");


form.addEventListener("submit", async function(e){

    e.preventDefault();


    const title = document.getElementById("title").value;

    const author = document.getElementById("author").value;

    const category = document.getElementById("category").value;

    const story = document.getElementById("story").value;



    const { data, error } = await supabaseClient
    .from("stories")
    .insert([
        {
            title: title,
            author: author,
            category: category,
            story: story
        }
    ]);



    if(error){

      console.log(JSON.stringify(error, null, 2));

        message.innerHTML =
        "❌ গল্প প্রকাশ হয়নি";

        message.style.color="red";

    }

    else{

        message.innerHTML =
        "✅ গল্প সফলভাবে প্রকাশ হয়েছে";

        message.style.color="green";


        form.reset();

    }



});