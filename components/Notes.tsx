"use client"

import { useState } from "react"
import { MentionsInput, Mention } from "react-mentions"

const users = [
  { id: "alice", display: "Alice" },
  { id: "bob", display: "Bob" },
  { id: "charlie", display: "Charlie" }
]

export default function Notes() {
  const [value, setValue] = useState("")

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="mb-2 text-lg font-semibold">Notes</h2>
      <MentionsInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full border rounded p-2"
        style={{ minHeight: "100px" }}
        placeholder="Type a note and use @ to mention..."
      >
        <Mention
          trigger="@"
          data={users}
          displayTransform={(id, display) => `@${display}`}
        />
      </MentionsInput>
      <p className="mt-2 text-sm text-gray-600">Preview: {value}</p>
    </div>
  )
}

