import Image from "next/image"

export function PoweredBy() {
    return (
        <div className=" flex items-center justify-center gap-2  transition-opacity duration-300">
            <span className="font-medium powered-blue-gradient">
                Powered by
            </span>
            <Image 
                src="/sg.svg" 
                alt="Sentient Geeks" 
                width={130} 
                height={20} 
                className="fill-blue-500"
            />
        </div>
    )
}
