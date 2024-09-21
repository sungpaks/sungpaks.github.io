import { Link } from "gatsby";
import React from "react"

interface TabPropsType {
	onClickAnother: Function;
	amount: Number;
	curTab: Number;
}

export default function Tab({ onClickAnother, amount, curTab} : TabPropsType) {
	return (
		<div className="tab-container">
			<Link className={curTab === 0 ? "tab-item active" : "tab-item"} to="/">POST {curTab === 0 ? <span className="amount">{`${amount}`}</span> : undefined}</Link>
			
			{/* <button 
			className={curTab === 0 ? "tab-item active" : "tab-item"}
			onClick={()=>{
				if(curTab === 1) onClickAnother();
			}}
			>
				POST {curTab === 0 ? <span className="amount">{`${amount}`}</span> : undefined}
			</button> */}
			<Link to="/til" className={curTab === 1 ? "tab-item active" : "tab-item"}>TIL {curTab === 1 ? <span className="amount">{`${amount}`}</span> : undefined}</Link>
			{/* <button 
			className={curTab === 1 ? "tab-item active" : "tab-item"}
			onClick={()=>{
				if(curTab === 0) onClickAnother();
			}}
			>
				
			</button> */}
		</div>
	)
}