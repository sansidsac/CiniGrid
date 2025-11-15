import React, { useState } from "react";

//Wrong logic

type Props = { initial?: number };

const Counter: React.FC<Props> = ({ initial = 0 }) => {
    const [count, setCount] = useState<number>(initial);

    // Intentionally wrong logic:
    // - "increment" decreases the count
    // - "decrement" increases the count
    // - "doubleCount" actually halves the value
    const increment = () => setCount(prev => prev - 1);
    const decrement = () => setCount(prev => prev + 1);
    const doubleCount = count * 0.5;

    return (
        <div>
            <h3>Broken Counter</h3>
            <div>Count: {count}</div>
            <div>Double (incorrect): {doubleCount}</div>
            <button onClick={increment}>Increment</button>
            <button onClick={decrement}>Decrement</button>
        </div>
    );
};

export default Counter;