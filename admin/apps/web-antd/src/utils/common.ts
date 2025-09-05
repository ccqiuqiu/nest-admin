/* eslint-disable unicorn/prefer-add-event-listener */
/**
 * 异步加载本地JS文件
 * @param {string} filePath - JS文件路径
 * @returns {Promise} 返回Promise对象
 */
export const loadJsFile = async (filePath: string) => {
  try {
    // 检查是否已经加载过
    if (document.querySelector(`script[src="${filePath}"]`)) {
      // console.log('JS文件已经加载过了');
      return;
    }

    // 创建script标签
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = filePath;

    // 返回Promise
    return new Promise((resolve, reject) => {
      // 加载成功
      script.addEventListener('load', () => {
        // console.log('JS文件加载成功！');
        resolve(true);
      });

      // 加载失败
      script.onerror = () => {
        console.log('JS文件加载失败，请检查文件路径');
        reject(new Error(`Failed to load script: ${filePath}`));
      };

      // 添加到head中
      document.head.append(script);
    });
  } catch (error: any) {
    console.log(`加载出错: ${error.message}`);
    throw error;
  }
};

/**
 * 异步加载本地CSS文件
 * @param {string} filePath - CSS文件路径
 * @returns {Promise} 返回Promise对象
 */
export const loadCssFile = async (filePath: string) => {
  try {
    // 检查是否已经加载过
    if (document.querySelector(`link[href="${filePath}"]`)) {
      // console.log('CSS文件已经加载过了');
      return;
    }

    // 创建link标签
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = filePath;

    // 返回Promise
    return new Promise((resolve, reject) => {
      // 加载成功
      link.addEventListener('load', () => {
        // console.log('CSS文件加载成功！');
        resolve(true);
      });

      // 加载失败
      link.onerror = () => {
        console.log('CSS文件加载失败，请检查文件路径');
        reject(new Error(`Failed to load stylesheet: ${filePath}`));
      };

      // 添加到head中
      document.head.append(link);
    });
  } catch (error: any) {
    console.log(`加载出错: ${error.message}`);
    throw error;
  }
};
