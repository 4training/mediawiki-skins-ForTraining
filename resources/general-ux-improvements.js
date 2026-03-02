// Improve list item bullets for Bible Translation section
// This is a fallback for browsers that don't support CSS ':has()''
document.querySelectorAll('.mw-parser-output ul li').forEach(li => {
  if (li.querySelector('a > img')) {
    li.style.display = 'flex';
    li.style.alignItems = 'center';
    li.style.listStyleType = 'none';
    li.style.lineHeight = '1';

    const bullet = document.createElement('span');
    bullet.textContent = '•';
    bullet.style.marginRight = '0.5rem';
    bullet.style.fontSize = '1.5rem';
    bullet.style.flexShrink = '0';

    li.insertBefore(bullet, li.firstChild);
  }
});

// Improve the diagram rendered at The Role of a Helper in Prayer
// This is a fallback for browsers that don't support CSS ':has()''
const img = document.querySelector('img[alt="Relationship Triangle.png"]');
if (img) {
  img.style.display = 'inline-block';
}