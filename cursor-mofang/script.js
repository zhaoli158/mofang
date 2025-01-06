document.addEventListener('DOMContentLoaded', function() {
    const fileInputs = document.querySelectorAll('.file-input');
    const analyzeBtn = document.getElementById('analyze');
    const stepsDiv = document.getElementById('steps');
    let uploadedFaces = 0;

    fileInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const preview = this.parentElement.querySelector('.preview');
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    preview.style.backgroundImage = `url(${e.target.result})`;
                    uploadedFaces++;
                    
                    if (uploadedFaces === 6) {
                        analyzeBtn.disabled = false;
                    }
                }
                
                reader.readAsDataURL(file);
            }
        });
    });

    analyzeBtn.addEventListener('click', function() {
        // 这里应该是调用魔方分析API的地方
        // 现在我们只显示示例步骤
        const exampleSteps = [
            "1. 首先完成白色十字",
            "2. 完成第一层白色面",
            "3. 解决第二层",
            "4. 完成顶层黄色十字",
            "5. 调整顶层角块位置",
            "6. 完成最后的角块方向"
        ];

        stepsDiv.innerHTML = exampleSteps.map(step => `<p>${step}</p>`).join('');
    });
}); 