(function() {
    var QUOTES = [
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
        { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
        { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
        { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
        { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
        { text: "Never let the fear of striking out keep you from playing the game.", author: "Babe Ruth" },
        { text: "Life is either a daring adventure or nothing at all.", author: "Helen Keller" },
        { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
        { text: "Not how long, but how well you have lived is the main thing.", author: "Seneca" },
        { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
        { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
        { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
        { text: "In the end, it's not the years in your life that count. It's the life in your years.", author: "Abraham Lincoln" },
        { text: "If you want to live a happy life, tie it to a goal, not to people or things.", author: "Albert Einstein" },
        { text: "You will face many defeats in life, but never let yourself be defeated.", author: "Maya Angelou" },
        { text: "Money and success don't change people; they merely amplify what is already there.", author: "Will Smith" },
        { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson" },
    ];
    function setQuote() {
        var el   = document.getElementById('quoteText');
        var auth = document.getElementById('quoteAuthor');
        if (!el || !auth) return;
        var q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        el.textContent   = q.text;
        auth.textContent = '\u2014 ' + q.author;
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setQuote);
    } else {
        setQuote();
    }
})();
