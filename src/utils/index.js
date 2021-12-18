// delay function
export const delay = async timeout => {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
}
// Use
// await delay(6000);
