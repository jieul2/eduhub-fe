import InputWithIcon from "../components/ui/input-with-icon/InputWithIcon";
import { Search } from "lucide-react";

export default function Home() {
  return (
    <div>
      <InputWithIcon
        size="xl"
        color="default"
        readOnly={false}
        leftIcon={<Search />}
        placeholder="Search"
      />
    </div>
  );
}
